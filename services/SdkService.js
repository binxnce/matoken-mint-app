import {
  MetaMaskWalletProvider,
  WalletConnectWalletProvider,
  Web3WalletProvider,
  Sdk,
  prepareAddress,
} from 'etherspot';
import { utils } from 'ethers';
import Service from './Service';
import sdkStateStorage from './sdkStateStorage';
import sdkSessionStorage from './sdkSessionStorage';
import httpUtils from '../utils/http';
import erc20Abi from '../utils/erc20.abi.json';
import config from '../config';

/**
 * @typedef {import('etherspot').Sdk} Sdk
 */
class SdkService extends Service {
  static CACHED_WALLET_KEY = 'etherspot:wallet';
  static SUPPORTED_WALLET_PROVIDERS = {
    METAMASK: 'MetaMask',
    WALLET_CONNECT: 'WalletConnect',
    TORUS: 'Torus',
  };

  /** @type {Sdk} */
  sdk;
  defaultSdkOptions = {
    env: config.etherspot.env,
    networkName: config.etherspot.networkName,
    projectKey: config.etherspot.projectKey,
    omitWalletProviderNetworkCheck: true,
  };

  async restoreSession() {
    const { providerName, walletAddress } = this.getCachedWallet();
    if (providerName && walletAddress) {
      return this.connectToCachedWallet(providerName, walletAddress);
    }
  }

  async initSdk(walletProvider) {
    this.sdk = new Sdk(walletProvider, {
      ...this.defaultSdkOptions,
      stateStorage: sdkStateStorage,
      sessionStorage: sdkSessionStorage,
    });

    await this.initSmartAccount();

    this.saveCachedWallet({
      providerName: this.getConnectedProviderType(),
      walletAddress: walletProvider.address,
    });

    return this.sdk.state;
  }

  async initSmartAccount() {
    await this.sdk.computeContractAccount({ sync: true });

    const authToken = await this.authorizeUser();

    if (authToken) {
      httpUtils.setCookie('token', authToken, 30);
      return;
    }

    return Promise.reject(new Error('Unable to authorize on API server'));
  }

  async killSession() {
    this.ensureSdkCreated();

    const {
      wallet: { address: walletAddress },
      network: { name: networkName },
    } = this.sdk.state;

    this.sdk.destroy();
    this.sdk = null;
    this.cleanWalletState(walletAddress, networkName);
  }

  async connectToCachedWallet(providerName, walletAddress) {
    const walletProvider = await this.connectToWalletProvider(providerName);
    // eslint-disable-next-line no-console
    console.log('provider restored');
    if (walletProvider.address !== walletAddress) {
      return Promise.reject(new Error('Wrong address set in localstorage'));
    }

    const sdkState = await this.initSdk(walletProvider);
    // eslint-disable-next-line no-console
    console.log('session restored', sdkState?.account);
    return { sdkState, walletProvider };
  }

  async connectToWalletProvider(providerName, data) {
    switch (providerName) {
      case SdkService.SUPPORTED_WALLET_PROVIDERS.METAMASK:
        return MetaMaskWalletProvider.connect();
      case SdkService.SUPPORTED_WALLET_PROVIDERS.WALLET_CONNECT:
        return new WalletConnectWalletProvider(data);
      case SdkService.SUPPORTED_WALLET_PROVIDERS.TORUS:
        return Web3WalletProvider.connect(data.provider);
    }
    return Promise.reject(new Error('Unsupported provider'));
  }

  ensureSdkCreated() {
    if (!this.sdk) {
      throw new Error('Etherspot SDK is not initialized');
    }
  }

  getConnectedProviderType() {
    this.ensureSdkCreated();
    const {
      wallet: { providerType },
    } = this.sdk.state;
    return providerType;
  }

  getCachedWallet() {
    let cachedWallet;

    try {
      const raw = localStorage.getItem(SdkService.CACHED_WALLET_KEY);
      cachedWallet = JSON.parse(raw) || null;
    } catch (err) {
      //
    }

    const providerName = cachedWallet && cachedWallet.providerName;
    const walletAddress = cachedWallet && cachedWallet.walletAddress;
    return { providerName, walletAddress };
  }

  saveCachedWallet(data = {}) {
    localStorage.setItem(SdkService.CACHED_WALLET_KEY, JSON.stringify(data));
  }

  cleanWalletState(walletAddress, networkName) {
    try {
      this.cleanCachedWallet();
      localStorage.removeItem(`${walletAddress}:${networkName}`);
      localStorage.removeItem(`${walletAddress}:session`);
    } catch (err) {
      //
    }
  }

  cleanCachedWallet() {
    try {
      localStorage.removeItem(SdkService.CACHED_WALLET_KEY);
    } catch (err) {
      //
    }
  }

  async sendTransactions(transactions, txGroupId) {
    try {
      this.ensureSdkCreated();
      this.sdk.clearGatewayBatch();

      for (const transaction of transactions) {
        await this.sdk.batchExecuteAccountTransaction({
          to: transaction.params.to,
          value: transaction.params.value || 0,
          data: transaction.params.data,
        });
      }

      let estimateParams;
      if (config.mainToken) {
        estimateParams = {
          refundToken: config.mainToken,
        };
      }

      const estimated = await this.sdk.estimateGatewayBatch(estimateParams); // TODO: check if enough balance
      // eslint-disable-next-line no-console
      console.log('estimated transaction', estimated);

      const txMetadata = {
        txId: txGroupId,
      };
      const result = await this.sdk.submitGatewayBatch({
        customProjectMetadata: JSON.stringify(txMetadata),
      });
      // eslint-disable-next-line no-console
      console.log('relayed transaction', result);
    } catch (e) {
      console.error(e);
      return Promise.reject(new Error(e.message));
    }
  }

  async authorizeUser() {
    const output = await this.sdk
      .callCurrentProject({
        payload: {
          message: {
            command: 'authorize',
            provider: this.getConnectedProviderType(),
            address: this.sdk.state.wallet.address,
          },
        },
      })
      .catch(console.error);

    let token;
    if (output && output?.status === 'ok' && output?.token) {
      token = output.token;
    }

    return token;
  }

  getNetwork() {
    return this.sdk?.state?.network;
  }

  getParamsForTokenTransfer(token, receiver, balance) {
    if (!token) {
      return {
        to: receiver,
        value: balance,
      };
    } else {
      const iface = new utils.Interface(erc20Abi);
      const data = iface.encodeFunctionData('transfer', [receiver, balance]);
      return {
        to: prepareAddress(token),
        data,
      };
    }
  }
}

export default SdkService;
