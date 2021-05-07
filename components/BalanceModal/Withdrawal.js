import React, { useCallback, useContext, useEffect, useState } from 'react';
import { prepareAddress } from 'etherspot';
import { BigNumber } from 'ethers';
import { CloseButton } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import debounce from 'lodash/debounce';

import Button from '../Button';
import config from '../../config';
import { formatPrice, formatFee } from '../../utils/ui';
import { toWei, isValidAddress, addressesEqual } from '../../utils/transactions';
import http from '../../utils/http';
import serviceContext from '../../services/serviceContext';

const SubmitButton = styled(Button)`
  margin-top: 5px;
`;

const Input = styled.input`
  width: 100%;
`;

const Amount = styled.div`
  margin: 0.2em 0 1em;
`;

const Fee = styled.div`
  color: grey;
  font-size: 14px;
  margin-top: 5px;
  margin-bottom: 5px;
`;

const MaxWithdrawalAmount = styled.div`
  color: grey;
  font-size: 14px;
  margin-bottom: 5px;
`;

const WithdrawalInfo = styled.div`
  position: relative;
  margin: 0.2em 0 1em;
`;

const WithdrawalInfoDetails = styled.div``;

const Note = styled.div`
  font-weight: normal;
  font-size: 13px;
`;

const AddressField = styled.div`
  margin-top: 10px;
  margin-bottom: 4px;
`;

const CloseWithdrawalInfoDetails = styled(CloseButton)`
  position: absolute;
  top: 0;
  right: 0;
`;

const Withdrawal = () => {
  const balance = useSelector((state) => state.users.current?.ethBalanceFormatted);
  const balanceRaw = useSelector((state) => state.users.current?.ethBalance);
  const accountAddress = useSelector((state) => state.users.current?.address);
  const walletProvider = useSelector((state) => state.users.walletProvider);

  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const [displayWithdrawalForm, setDisplayWithdrawalForm] = useState(false);
  const [withdrawalData, setWithdrawalData] = useState(null);
  const [withdrawalFee, setWithdrawalFee] = useState(undefined);
  const [maxWithdrawalAmount, setMaxWithdrawalAmount] = useState(undefined);
  const [withdrawalStatus, setWithdrawalStatus] = useState('');

  const { balanceService, sdkService } = useContext(serviceContext);
  const network = sdkService.getNetwork();

  useEffect(() => {
    walletProvider?.address && setWithdrawalAddress(walletProvider.address);
  }, [walletProvider?.address]);

  useEffect(() => {
    withdrawalAmount && updateEstimate(withdrawalAmount);
  }, [balance]);

  useEffect(() => {
    withdrawalAmount && isValidAddress(withdrawalAddress) && updateEstimate(withdrawalAmount);
  }, [withdrawalAddress]);

  const updateEstimate = useCallback(
    debounce(async (balance) => {
      const sendAmount = validateWithdrawalAmount(balance);
      if (!sendAmount) return resetFeeInfo();
      const amountInWei = toWei(sendAmount.toString());

      const receiverAddress = validateWithdrawalAddress(withdrawalAddress);
      if (!receiverAddress) return resetFeeInfo();

      balanceService
        .estimateWithdrawal(amountInWei, receiverAddress)
        .then((withdrawalFee) => {
          setWithdrawalFee(withdrawalFee);
          setMaxWithdrawalAmount(BigNumber.from(balanceRaw).sub(withdrawalFee));
        })
        .catch((e) => {
          console.error(e);
          setWithdrawalStatus('Unable to calculate the fee, try to reduce the amount');
        });
    }, 500),
    [withdrawalAddress, balance],
  );

  const resetFeeInfo = () => {
    setWithdrawalFee(undefined);
    setMaxWithdrawalAmount(undefined);
  };

  const validateWithdrawalAmount = (withdrawalAmount) => {
    const sendAmount = Number(withdrawalAmount);
    if (!sendAmount || Number.isNaN(sendAmount)) {
      setWithdrawalStatus('Invalid amount specified');
      return;
    }

    if (Number(balance) < sendAmount) {
      setWithdrawalStatus('You are trying to withdraw more than you have');
      return;
    }

    return sendAmount;
  };

  const validateWithdrawalAddress = (withdrawalAddress) => {
    if (!withdrawalAddress) {
      setWithdrawalStatus('Empty address specified');
      return;
    }

    if (!isValidAddress(withdrawalAddress)) {
      setWithdrawalStatus('Invalid address specified');
      return;
    }

    if (addressesEqual(withdrawalAddress, accountAddress)) {
      setWithdrawalStatus('Funds are already on that address');
      return;
    }

    return prepareAddress(withdrawalAddress);
  };

  const onTransactionUpdate = (data) => {
    setWithdrawalData((currentData) => ({
      ...currentData,
      status: data?.transaction.state,
      txHash: data?.transaction.hash,
    }));
  };

  const withdraw = async () => {
    const sendAmount = validateWithdrawalAmount(withdrawalAmount);
    if (!sendAmount) return;
    const amountInWei = toWei(sendAmount.toString());

    const receiverAddress = validateWithdrawalAddress(withdrawalAddress);
    if (!receiverAddress) return;

    const data = await balanceService.withdraw(amountInWei, receiverAddress);
    const { hash, state } = data;
    balanceService.subscribeToTransactionUpdate(hash).then(onTransactionUpdate);

    return {
      hash,
      status: state,
      amount: sendAmount,
      receiverAddress,
    };
  };

  const handleWithdrawal = async () => {
    setWithdrawalStatus('');

    const result = await withdraw();

    if (result && result.hash) {
      setWithdrawalData(result);
      toggleWithdrawalForm();

      const { hash, amount, receiverAddress } = result;
      http
        .post(`${config.apiUrl}/transaction/register-withdrawal`, {
          hash,
          amount,
          receiver: receiverAddress,
        })
        .catch(console.error);
    }
  };

  const onWithdrawalAmountChange = (event) => {
    setWithdrawalAmount(event.target.value);
    setWithdrawalStatus('');
    updateEstimate(event.target.value);
  };

  const onWithdrawalAddressChange = (event) => {
    setWithdrawalAddress(event.target.value);
    setWithdrawalStatus('');
  };

  const toggleWithdrawalForm = () => {
    setWithdrawalStatus('');
    setDisplayWithdrawalForm((state) => !state);
  };

  const hideWithdrawalDetails = () => {
    setWithdrawalData(null);
  };

  const getTxDetailsLink = (hash) => {
    return `${config.bcxUrl}${hash}`;
  };

  return (
    <>
      <Button onClick={toggleWithdrawalForm}>Withdraw</Button>

      {displayWithdrawalForm && (
        <Amount>
          Amount:{' '}
          <Input value={withdrawalAmount} onChange={onWithdrawalAmountChange} placeholder={formatPrice(balanceRaw)} />
          <br />
          <AddressField>
            Address: <Input value={withdrawalAddress} onChange={onWithdrawalAddressChange} />
          </AddressField>
          {withdrawalFee && <Fee>Fee: {formatFee(withdrawalFee)}</Fee>}
          {maxWithdrawalAmount && <MaxWithdrawalAmount>Max: {formatPrice(maxWithdrawalAmount)}</MaxWithdrawalAmount>}
          {!!network && <Note>Note: Funds will be transferred on the {network.name} network</Note>}
          <SubmitButton onClick={handleWithdrawal} variant="tertiary-inline">
            Withdraw
          </SubmitButton>
          {!!withdrawalStatus && <div>{withdrawalStatus}</div>}
        </Amount>
      )}

      {withdrawalData && (
        <WithdrawalInfo>
          <div>Withdrawal submitted!</div>
          <CloseWithdrawalInfoDetails label="" onClick={hideWithdrawalDetails} />
          <div>Status: {withdrawalData.status}</div>
          {!!withdrawalData.txHash && (
            <WithdrawalInfoDetails>
              You can view transaction details{' '}
              <a href={getTxDetailsLink(withdrawalData.txHash)} target="_blank" rel="noopener noreferrer">
                here
              </a>
            </WithdrawalInfoDetails>
          )}
        </WithdrawalInfo>
      )}
    </>
  );
};

Withdrawal.propTypes = {};

export default Withdrawal;
