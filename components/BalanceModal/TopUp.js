import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CloseButton } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import Button from '../Button';
import DevTopUp from './DevTopUp';
import BridgeTransactionStatus from './BridgeTransactionStatus';
import RampTopUp from './RampTopUp';
import TopUpStatus, { TOP_UP_STATUSES } from './TopUpStatus';
import config from '../../config';
import { formatCurrency } from '../../utils/ui';
import { BINANCE_BRIDGE_STATUSES, BRIDGE_TYPES } from '../../utils/constants';
import http from '../../utils/http';
import serviceContext from '../../services/serviceContext';

const SubmitButton = styled(Button)`
  margin-left: 0.6em;
`;

const TopUpAmount = styled.div`
  margin: 0.2em 0 1em;
`;

const TopUpSum = styled.div`
  color: grey;
  font-size: 14px;
  margin-bottom: 5px;
`;

const TxInfo = styled.div`
  position: relative;
  margin: 0.2em 0 1em;
`;

const TxInfoDetails = styled.div``;

const TopUpDescription = styled.div`
  margin-bottom: 15px;
  font-size: 15px;
`;

const CloseTxInfoDetails = styled(CloseButton)`
  position: absolute;
  top: 0;
  right: 0;
`;

const FETCH_TX_STATUS_INTERVAL = 5000;

const TopUp = ({ dualNetwork, balanceOnConnectedNetwork, onModalHide }) => {
  const address = useSelector((state) => state.users.current?.address);
  const topUpContract = useSelector((state) => state.users.current?.topUpContract);
  const walletProvider = useSelector((state) => state.users.walletProvider);

  const trackBridgeTransactionInterval = useRef(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [displayTopUpAmount, setDisplayTopUpAmount] = useState(false);
  const [topUpTxHash, setTopUpTxHash] = useState('');
  const [minTopUpAmount, setMinTopUpAmount] = useState(0);
  const [maxTopUpAmount, setMaxTopUpAmount] = useState(undefined);
  const [bridgeEnabled, setBridgeEnabled] = useState(true);
  const [topUpStatus, setTopUpStatus] = useState('');
  const [bridgeTopUpData, setBridgeTopUpData] = useState(null);
  const [topUpFee, setTopUpFee] = useState(undefined);

  const { balanceService } = useContext(serviceContext);

  const defaultTopUpViaBridgeValue = config.mainToken ? '10' : '0.2';
  const topUpCurrencySymbol = dualNetwork ? topUpContract.currencySymbol : config.currencySymbol;

  const resetBridgeData = () => {
    setMinTopUpAmount(0);
    setMaxTopUpAmount(undefined);
    setBridgeEnabled(true);
    setBridgeTopUpData(null);
    setTopUpFee(undefined);
  };

  useEffect(() => {
    if (!walletProvider?.networkName || !dualNetwork || dualNetwork !== topUpContract?.networkName) {
      return;
    }

    balanceService
      .loadBridgeData(topUpContract, walletProvider.address, walletProvider)
      .then(async (data) => {
        if (!data) {
          resetBridgeData();
          return;
        }

        const { minAmount = 0, maxAmount, bridgeEnabled, fee } = data;
        setMinTopUpAmount(minAmount);
        setMaxTopUpAmount(maxAmount);
        setBridgeEnabled(bridgeEnabled);
        setTopUpFee(fee);
      })
      .catch(console.error);
  }, [walletProvider]);

  const validateTopUpAmount = (topUpAmount) => {
    const sendAmount = Number(topUpAmount);
    if (!sendAmount || Number.isNaN(sendAmount)) {
      setTopUpStatus('Invalid amount specified');
      return;
    }

    if (Number(balanceOnConnectedNetwork) < sendAmount) {
      setTopUpStatus('You are trying to send more than you have');
      return;
    }

    if (minTopUpAmount > 0 && sendAmount < minTopUpAmount) {
      setTopUpStatus(`Minimal top up amount is ${formatCurrency(minTopUpAmount, topUpCurrencySymbol)}`);
      return;
    }

    if (maxTopUpAmount !== undefined && sendAmount > maxTopUpAmount) {
      setTopUpStatus(`Maximal top up amount is ${formatCurrency(maxTopUpAmount, topUpCurrencySymbol)}`);
      return;
    }

    return sendAmount;
  };

  const topUpFromTheSameNetwork = async () => {
    const sendAmount = validateTopUpAmount(topUpAmount);
    if (!sendAmount) return;

    const hash = await balanceService.topUpFromSameNetwork(walletProvider, address, sendAmount);
    return {
      hash,
      amount: sendAmount,
    };
  };

  const topUpFromAnotherNetwork = async () => {
    const sendAmount = validateTopUpAmount(topUpAmount);
    if (!sendAmount) return;

    let intentData;
    let extraData;
    let bridgeAddress = topUpContract?.bridgeAddress;

    if (topUpContract?.type === BRIDGE_TYPES.BINANCE_BRIDGE) {
      if (!bridgeEnabled) return;
      setTopUpStatus('Registering top up intent..');
      try {
        intentData = await balanceService.registerIntent(topUpContract, sendAmount, walletProvider.address, address);
        bridgeAddress = intentData?.depositAddress;
      } catch (e) {
        const errorMessage = e?.message || 'Error happened while trying to registering a top up intent';
        setTopUpStatus(errorMessage);
        console.error(e);
        return;
      }
    }

    if (balanceService.isPermisionnedTokenTopUp(topUpContract)) {
      if (!bridgeEnabled) {
        setTopUpStatus('Unable to connect to the top up bridge');
        return;
      }

      setTopUpStatus('Please sign the approval');

      extraData = await balanceService.getTokenPermit(walletProvider, topUpContract).catch(console.error);
      if (!extraData.signature) {
        setTopUpStatus('Approval rejected');
        return;
      }

      setTopUpStatus(TOP_UP_STATUSES.OPEN_METAMASK_AGAIN);
    }

    const hash = await balanceService.topUpFromAnotherNetwork(
      topUpContract,
      walletProvider,
      address,
      bridgeAddress,
      sendAmount,
      extraData,
    );

    if (!hash) {
      setTopUpStatus('');
    }

    return {
      hash,
      amount: sendAmount,
      intentData,
    };
  };

  const topUp = async () => {
    setTopUpStatus('');

    let topUpResult;
    if (!dualNetwork) {
      topUpResult = await topUpFromTheSameNetwork();
    } else {
      topUpResult = await topUpFromAnotherNetwork();
    }

    if (topUpResult && topUpResult.hash) {
      const { hash, amount, intentData } = topUpResult;

      if (intentData) {
        setBridgeTopUpData(intentData);
        trackBridgeTransaction(intentData.id);
      }

      setTopUpStatus('Transaction submitted!');
      setTopUpTxHash(hash);
      toggleTopUpAmount();

      http
        .post(config.apiUrl + '/transaction/register-deposit', {
          fromAddress: walletProvider.address,
          type: !dualNetwork ? 'sameNetwork' : 'bridge',
          hash,
          amount,
          externalId: intentData?.id,
          depositContractAddress: intentData?.depositAddress,
        })
        .catch(console.error);
    }
  };

  const resetBridgeTransactionInterval = () => {
    if (trackBridgeTransactionInterval.current) {
      clearInterval(trackBridgeTransactionInterval.current);
      trackBridgeTransactionInterval.current = null;
    }
  };

  // NOTE: we're starting to listen when there is a transaction hash only
  const trackBridgeTransaction = useCallback((bridgeTransactionId) => {
    resetBridgeTransactionInterval();

    let prevStatus;
    let failedToFetchTimes = 0;

    const interval = setInterval(async () => {
      const { WAITING_FOR_DEPOSIT, CANCELLED, WITHDRAW_IN_PROGRESS, DEPOSIT_IN_PROGRESS } = BINANCE_BRIDGE_STATUSES;
      let needToClearInterval = false;
      let needToResetBridgeTopUpData = false;

      const depositInfo = await balanceService.fetchDepositInfo(bridgeTransactionId).catch(console.error);
      if (!depositInfo) ++failedToFetchTimes;

      if (depositInfo?.status && depositInfo.status !== WAITING_FOR_DEPOSIT) {
        if (![WITHDRAW_IN_PROGRESS, DEPOSIT_IN_PROGRESS].includes(depositInfo.status)) {
          needToClearInterval = true;
        }

        if (depositInfo.status === CANCELLED) {
          needToResetBridgeTopUpData = true;
        }

        // notify backend about the changed status
        if (prevStatus !== depositInfo.status) {
          http
            .post(`${config.apiUrl}/transaction/sync-binance-bridge-deposit/${bridgeTransactionId}`)
            .catch(console.error);
        }
        prevStatus = depositInfo.status;
      }

      if (failedToFetchTimes === 10) {
        needToClearInterval = true;
      }

      if (needToResetBridgeTopUpData) {
        setBridgeTopUpData(null);
      } else if (depositInfo) {
        setBridgeTopUpData(depositInfo);
      }

      if (needToClearInterval) {
        clearInterval(interval);
        trackBridgeTransactionInterval.current = null;
      }
    }, FETCH_TX_STATUS_INTERVAL);
    trackBridgeTransactionInterval.current = interval;
  }, []);

  useEffect(() => {
    resetBridgeTransactionInterval();
  }, []);

  const onTopUpAmountChange = (event) => {
    setTopUpAmount(event.target.value);
    setTopUpStatus('');
  };

  const toggleTopUpAmount = () => {
    setTopUpStatus('');
    setDisplayTopUpAmount((state) => !state);
  };

  const hideTxDetails = () => {
    setTopUpTxHash('');
  };

  const getTxDetailsLink = (hash) => {
    return dualNetwork
      ? `${topUpContract?.bcxUrl}${hash}` //
      : `${config.bcxUrl}${hash}`;
  };

  const bridgeTopUpSubmitted = !!(bridgeTopUpData && topUpTxHash);
  const showXdaiCreditCardTopUp = config.chainId === 100;

  return (
    <>
      {!dualNetwork && <Button onClick={toggleTopUpAmount}>Top up</Button>}

      {!!dualNetwork && dualNetwork === topUpContract.networkName && (
        <Button onClick={toggleTopUpAmount}>Top up via Bridge</Button>
      )}

      {showXdaiCreditCardTopUp && (
        <RampTopUp userAddress={address} onModalHide={onModalHide}>
          Top up with Credit Card
        </RampTopUp>
      )}

      {displayTopUpAmount && (
        <TopUpAmount>
          {!dualNetwork && (
            <TopUpDescription>This will top up your Dank account from the connected wallet</TopUpDescription>
          )}
          Amount:{' '}
          <input
            value={topUpAmount}
            onChange={onTopUpAmountChange}
            placeholder={formatCurrency(defaultTopUpViaBridgeValue, topUpCurrencySymbol, { roundDecimals: false })}
          />
          <SubmitButton onClick={topUp} variant="tertiary-inline">
            Top up
          </SubmitButton>
          {minTopUpAmount > 0 && <TopUpSum>Min: {formatCurrency(minTopUpAmount, topUpCurrencySymbol)}</TopUpSum>}
          {!!maxTopUpAmount && <TopUpSum>Max: {formatCurrency(maxTopUpAmount, topUpCurrencySymbol)}</TopUpSum>}
          <TopUpSum>You have: {formatCurrency(balanceOnConnectedNetwork, topUpCurrencySymbol)}</TopUpSum>
          {!!topUpFee && !!topUpAmount && (
            <TopUpSum>Fee: {formatCurrency(Number(topUpAmount) * (topUpFee / 100), topUpCurrencySymbol)}</TopUpSum>
          )}
          {!bridgeEnabled && <div>Unfortunately, the top up bridge is currently disabled</div>}
          {!!topUpStatus && <TopUpStatus status={topUpStatus} />}
        </TopUpAmount>
      )}

      {bridgeTopUpSubmitted && <BridgeTransactionStatus swap={bridgeTopUpData} depositTxHash={topUpTxHash} />}

      {/* regular top up, not via the bridge */}
      {topUpTxHash && !bridgeTopUpSubmitted && (
        <TxInfo>
          <CloseTxInfoDetails label="" onClick={hideTxDetails} />
          <TxInfoDetails>
            You can view transaction details{' '}
            <a href={getTxDetailsLink(topUpTxHash)} target="_blank" rel="noopener noreferrer">
              here
            </a>
          </TxInfoDetails>
        </TxInfo>
      )}

      {!!walletProvider && (
        <DevTopUp dualNetwork={dualNetwork} topUpContract={topUpContract} walletProvider={walletProvider} />
      )}
    </>
  );
};

TopUp.propTypes = {
  dualNetwork: PropTypes.string.isRequired,
  balanceOnConnectedNetwork: PropTypes.string.isRequired,
  onModalHide: PropTypes.func.isRequired,
};

export default TopUp;
