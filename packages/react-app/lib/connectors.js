import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";

import { getLocal, removeLocal, setLocal } from "./local";

export const CACHED_CONNECTOR_KEY = "WEB3_REACT_CACHED_CONNECTOR";

export const injected = new InjectedConnector({
  // TODO: Add support for mainnet
  supportedChainIds: [1, 5],
});

export const walletConnect = new WalletConnectConnector({
  rpc: {
    // Mainnet only
    1: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`,
  },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  pollingInterval: 15000,
});

export const walletLink = new WalletLinkConnector({
  // Mainnet only
  url: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`,
  appName: "MAToken Mint",
  appLogoUrl: "",
});

export const getConnectorName = (connector) => {
  if (connector instanceof InjectedConnector) {
    return "metamask";
  }
  if (connector instanceof WalletConnectConnector) {
    return "wallet-connect";
  }
  if (connector instanceof WalletLinkConnector) {
    return "wallet-link";
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
    case "wallet-link":
      return walletLink;
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
    name: "wallet-link",
    displayName: "Coinbase Wallet",
    connector: walletLink,
  },
  {
    name: "wallet-connect",
    displayName: "WalletConnect",
    connector: walletConnect,
  },
];
