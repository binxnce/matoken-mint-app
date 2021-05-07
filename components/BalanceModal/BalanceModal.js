import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { utils } from 'ethers';

import serviceContext from '../../services/serviceContext';
import { getUser, signOutUser } from '../../redux/users';
import config from '../../config';
import { formatCurrency } from '../../utils/ui';
import Modal from '../Modal';
import Button, { LinkButton } from '../Button';
import BalanceModalAddress from './BalanceModalAddress';
import TopUp from './TopUp';
import Withdrawal from './Withdrawal';

const Title = styled.h2`
  font-size: 1em;
  color: grey;
  margin-bottom: 0;
`;

const BalanceText = styled.p`
  font-size: 2em;
`;

const MainTokenInfo = styled.p`
  font-size: 2em;
`;

/*const UnsupportedNetwork = styled.div`
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 0.25rem;
  background-color: #e4e429;
`;*/

const getDualNetworkCurrency = (networkName) => {
  switch (networkName) {
    case 'bsc':
      return 'BNB';
    case 'xdai':
      return '$';
    default:
      return 'ETH';
  }
};

const BalanceModal = ({ ...modalProps }) => {
  const address = useSelector((state) => state.users.current?.address);
  const balance = useSelector((state) => state.users.current?.ethBalanceFormatted);
  const topUpContract = useSelector((state) => state.users.current?.topUpContract);
  const walletProvider = useSelector((state) => state.users.walletProvider);
  const [balanceOnConnectedNetwork, setBalanceOnConnectedNetwork] = useState('');
  const [dualNetwork, setDualNetwork] = useState('');

  const dispatch = useDispatch();
  const { sdkService, balanceService } = useContext(serviceContext);
  const router = useRouter();
  const network = sdkService.getNetwork();

  // const unsupportedNetwork = dualNetwork && dualNetwork !== topUpContract?.networkName;
  const dualNetworkCurrency =
    dualNetwork && topUpContract?.networkName === dualNetwork
      ? topUpContract?.currencySymbol //
      : getDualNetworkCurrency(dualNetwork);

  const refreshConnectedProviderBalance = async () => {
    let updateDualNetwork = false;
    let dualNetworkName = dualNetwork;

    if (walletProvider.networkName !== network?.name) {
      dualNetworkName = walletProvider.networkName;
      updateDualNetwork = true;
    } else if (dualNetwork) {
      // user switched from another network to project's
      dualNetworkName = '';
      updateDualNetwork = true;
    }

    if (updateDualNetwork) {
      setDualNetwork(dualNetworkName);
    }

    const balance = await balanceService.fetchBalance(walletProvider, topUpContract, dualNetworkName);
    setBalanceOnConnectedNetwork(utils.formatEther(balance));
  };

  useEffect(() => {
    if (walletProvider?.networkName) {
      refreshConnectedProviderBalance();
    }
  }, [walletProvider]);

  const signOut = () => {
    sdkService
      .killSession()
      .then(() => signOutUser()(dispatch))
      .catch(() => null)
      .finally(() => {
        router.push('/');
      });
  };

  const refreshBalance = () => {
    refreshConnectedProviderBalance();
    getUser()(dispatch);
  };

  return (
    <Modal
      {...modalProps}
      bodyStyle={{
        display: 'grid',
        gridGap: '20px',
        alignItems: 'stretch',
      }}
    >
      {!!dualNetwork && (
        <div>
          <Title>You&apos;re connected to the {dualNetwork}</Title>
          <BalanceText>{formatCurrency(balanceOnConnectedNetwork, dualNetworkCurrency)}</BalanceText>
        </div>
      )}
      {/*{unsupportedNetwork && (
        <UnsupportedNetwork>You&apos;re connected to the unsupported network</UnsupportedNetwork>
      )}*/}

      <div>
        <Title>Your Dank balance on {network ? network.name : 'Unknown'} network</Title>
        <BalanceText>{formatCurrency(balance, config.currencySymbol)}</BalanceText>
      </div>

      {!!config.mainToken && (
        <div>
          <Title>Project&apos;s main token</Title>
          <MainTokenInfo>
            {!config.mainTokenDetails && config.mainTokenTicker}
            {!!config.mainTokenDetails && (
              <a href={config.mainTokenDetails} target="_blank" rel="noopener noreferrer">
                {config.mainTokenTicker}
              </a>
            )}
          </MainTokenInfo>
        </div>
      )}

      <TopUp
        dualNetwork={dualNetwork}
        balanceOnConnectedNetwork={balanceOnConnectedNetwork}
        onModalHide={modalProps.onHide}
      />
      <Withdrawal />

      <Button onClick={refreshBalance} variant="secondary">
        Refresh Balance
      </Button>
      <BalanceModalAddress address={address} />
      <LinkButton onClick={signOut} small color="negative">
        Logout
      </LinkButton>
    </Modal>
  );
};

export default BalanceModal;
