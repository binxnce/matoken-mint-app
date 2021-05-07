import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { MetaMaskWalletProvider } from 'etherspot';
import WalletConnect from '@walletconnect/client';
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { TorusConnector } from "@web3-react/torus-connector";


import { getLocal, removeLocal, setLocal } from "./local";

export const CACHED_CONNECTOR_KEY = "WEB3_REACT_CACHED_CONNECTOR";

export const injected = new InjectedConnector({
  // TODO: Add support for mainnet
  supportedChainIds: [1, 137, 80001],
});

export const walletConnect = new WalletConnectConnector({
  rpc: {
    1: `https://mainnet.infura.io/v3/${process.env.INFURA_TOKEN}`,
    137: 'https://rpc-mainnet.maticvigil.com',
    80001: 'RPC	https://rpc-mumbai.maticvigil.com',
  },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  pollingInterval: 15000,
});

export const torusConnect = new TorusConnector({ chainId: 80001 });

export const getConnectorName = (connector) => {
  if (connector instanceof InjectedConnector) {
    return "metamask";
  }
  if (connector instanceof WalletConnectConnector) {
    return "wallet-connect";
  }
  if (connector instanceof TorusConnector) {
    return "torus-connect";
  }
  return "";
};

const getConnector = (name) => {
  switch (name) {
    case "metamask":
      return injected;
    case "injected-mobile":
      return injectedMobile;
    case "wallet-connect":
      return walletConnect;
    case "torus-connect":
      return torusConnect;
    default:
      return null;
  }
};

export const deactivateConnector = (connector, web3ReactContext) => {
  const { deactivate } = web3ReactContext;

  const connectorName = getConnectorName(connector);

  removeLocal(CACHED_CONNECTOR_KEY);
  if (connectorName === "wallet-connect") {
    connector.close();
  } else {
    deactivate();
  }
};

export const activateConnector = (
  connector,
  web3ReactContext,
  onError = () => {}
) => {
  const { activate } = web3ReactContext;
  setLocal(CACHED_CONNECTOR_KEY, getConnectorName(connector));
  activate(connector, undefined, true).catch(onError);
};

export const eagerConnect = (web3ReactContext) => {
  const cachedConnector = getLocal(CACHED_CONNECTOR_KEY) || null;
  if (!cachedConnector) return;

  const connector = getConnector(cachedConnector);
  activateConnector(connector, web3ReactContext, () => {
    removeLocal(CACHED_CONNECTOR_KEY);
  });
};

export default [
  {
    name: "metamask",
    displayName: "MetaMask",
    connector: injected,
  },
  {
    name: "wallet-connect",
    displayName: "WalletConnect",
    connector: walletConnect,
  },
  {
    name: "torus",
    displayName: "torus",
    connector: torusConnect,
  },
];


