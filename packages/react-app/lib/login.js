import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { MetaMaskWalletProvider } from 'etherspot';
import cookie from 'cookie-cutter';
import noop from 'lodash/noop';
import { setSdkUser, setWalletProvider } from './users.js';


export const login = async (providerType, providerData) => {
  try {
    console.log('Attempting to login ', providerType, providerData);
    const walletProvider = await sdkService.connectToWalletProvider(providerType, providerData);
    const sdkState = await sdkService.initSdk(walletProvider);
    if (!sdkState) throw new Error('Unable to connect to the server');
    const { account } = sdkState;
    setSdkUser(account)(dispatch);
    setWalletProvider(walletProvider)(dispatch);
  } catch (err) {
    await sdkService.killSession().catch((_) => _);
    alert(err.message);
  }
};

export const loginMetamask = async (e) => {
  e.preventDefault();
  if (!MetaMaskWalletProvider.detect()) {
    alert('MetaMask is not detected');
    return;
  }
  await login(SdkService.SUPPORTED_WALLET_PROVIDERS.METAMASK);
};

export const loginWalletConnect = async (e) => {
  e.preventDefault();

  walletConnect = new WalletConnect({
    bridge: 'https://bridge.walletconnect.org',
    qrcodeModal: QRCodeModal,
  });

  if (!walletConnect.connected) {
    await walletConnect.createSession().catch((e) => alert(e.message));
  }

  window.walletConnectConnector = walletConnect;
  subscribeToEvents();
};

export const loginTorus = async (e) => {
  e.preventDefault();

  const torus = new Torus();
  try {
    await torus.init();
    await torus.login();
  } catch (e) {
    alert(e.message);
    return;
  }

  await login(SdkService.SUPPORTED_WALLET_PROVIDERS.TORUS, torus);
};

export const subscribeToEvents = () => {
  if (!walletConnect) {
    return;
  }

  walletConnect.on('session_update', async (error, payload) => {
    if (error) {
      throw error;
    }
    const { chainId, accounts } = payload.params[0];
    onSessionUpdate(accounts, chainId);
  });

  walletConnect.on('connect', (error, payload) => {
    if (error) {
      throw error;
    }
    const { chainId, accounts } = payload.params[0];
    onSessionUpdate(accounts, chainId);
  });

  walletConnect.on('disconnect', (error) => {
    if (error) {
      throw error;
    }
    sdkService
      .killSession()
      .catch(() => null)
      .finally(() => {
        window.location.href = '/';
      });
  });

  if (walletConnect.connected) {
    const { chainId, accounts } = walletConnect;
    onSessionUpdate(accounts, chainId);
  }
};

// eslint-disable-next-line no-unused-vars
export const onSessionUpdate = async (accounts, chainId) => {
  /*if (chainId !== config.chainId) {
    alert('Wrong network selected');
    return;
  }*/
  await login(SdkService.SUPPORTED_WALLET_PROVIDERS.WALLET_CONNECT, walletConnect);
};