import { utils, BigNumber } from 'ethers';
import { NotificationTypes } from 'etherspot';
import { filter, take } from 'rxjs/operators';
import Service from './Service';
import { BRIDGE_TYPES } from '../utils/constants';
import http from '../utils/http';
import config from '../config';
import erc20Abi from '../utils/erc20.abi.json';
import daiAbi from '../utils/dai.partial.abi.json';
import { fromWei, getDaiPermitData, addressesEqual } from '../utils/transactions';

const BINANCE_API = 'https://api.binance.org/bridge/api';

class BalanceService extends Service {
  async getNonce(walletProvider) {
    return await walletProvider.sendRequest('eth_getTransactionCount', [walletProvider.address, 'pending']);
  }

  async fetchBalance(walletProvider, topUpContract, dualNetwork) {
    // get main network currency balance
    if (
      (!dualNetwork && !config.mainToken) || //
      !topUpContract?.type ||
      (topUpContract.type === BRIDGE_TYPES.MULTI_TOKEN_BRIDGE && this.isMultiTokenBridgeEthTopUp(topUpContract))
    ) {
      return await walletProvider
        .sendRequest('eth_getBalance', [walletProvider.address, 'latest']) //
        .then((balance) => (balance !== '0x' ? balance : 0))
        .catch((e) => {
          console.error(e);
          return 0;
        });
    }

    // get token balance
    const tokenAddress = !dualNetwork ? config.mainToken : topUpContract.tokenAddress;
    const iface = new utils.Interface(erc20Abi);
    const data = iface.encodeFunctionData('balanceOf', [walletProvider.address]);
    return await walletProvider
      .sendRequest('eth_call', [
        {
          from: walletProvider.address,
          to: tokenAddress,
          data,
        },
      ])
      .then((balance) => (balance !== '0x' ? balance : 0))
      .catch((e) => {
        console.error(e);
        return 0;
      });
  }

  async loadBridgeData(topUpContract, userAddress, walletProvider) {
    switch (topUpContract?.type) {
      case BRIDGE_TYPES.BINANCE_BRIDGE:
        return this.loadBinanceBridgeData(topUpContract, userAddress);
      case BRIDGE_TYPES.XDAI_BRIDGE:
        return this.loadXdaiBridgeData(topUpContract, userAddress, walletProvider);
      case BRIDGE_TYPES.MULTI_TOKEN_BRIDGE:
        return this.loadMultiTokenBridgeData(topUpContract);
    }
  }

  async loadBinanceBridgeData(topUpContract, userAddress) {
    const symbol = topUpContract.currencySymbol;
    const [tokensResponse, tokenNetworksResponse, quotasResponse] = await Promise.all([
      http.get(`${BINANCE_API}/v2/tokens?walletNetwork=ETH`, { credentials: undefined }),
      http.get(`${BINANCE_API}/v2/tokens/${symbol}/networks`, { credentials: undefined }),
      http.get(`${BINANCE_API}/v1/swaps/quota/24hour?symbol=${symbol}&walletAddress=${userAddress}`, {
        credentials: undefined,
      }),
    ]);
    const tokens = tokensResponse?.data?.data?.tokens || [];
    const tokenNetworks = tokenNetworksResponse?.data?.data?.networks || [];
    const quota = quotasResponse?.data?.data || {};

    const tokenData = tokens.find(({ symbol }) => symbol === topUpContract.currencySymbol);
    const networkData = tokenNetworks.find(({ name }) => name === 'ETH');

    const tokenDataMaxAmount = tokenData?.maxAmount ?? 0;
    const maxAmount = Math.min(quota?.left ?? tokenDataMaxAmount, tokenDataMaxAmount);

    return {
      minAmount: tokenData?.minAmount,
      maxAmount,
      bridgeEnabled: networkData?.depositEnabled ?? false,
    };
  }

  async loadXdaiBridgeData(topUpContract, userAddress, walletProvider) {
    let bridgeEnabled = true;
    const iface = new utils.Interface(topUpContract?.abi);
    const [minAmount, maxAmount] = await Promise.all([
      walletProvider
        .sendRequest('eth_call', [
          {
            from: userAddress,
            to: topUpContract?.bridgeAddress,
            data: iface.encodeFunctionData('minPerTx', []),
          },
        ])
        .then((result) => (result !== '0x' ? Number(fromWei(result)) : 0)),
      walletProvider
        .sendRequest('eth_call', [
          {
            from: userAddress,
            to: topUpContract?.bridgeAddress,
            data: iface.encodeFunctionData('maxPerTx', []),
          },
        ])
        .then((result) => (result !== '0x' ? Number(fromWei(result)) : 0)),
    ]).catch((e) => {
      bridgeEnabled = false;
      console.error(e);
    });

    return {
      minAmount,
      maxAmount,
      bridgeEnabled,
    };
  }

  loadMultiTokenBridgeData(topUpContract) {
    const tokenDetails = this.getMultiTokenBridgeTokenDetails(topUpContract);
    if (!tokenDetails?.incoming) {
      return { bridgeEnabled: false };
    }

    return {
      minAmount: tokenDetails.incoming.min,
      maxAmount: tokenDetails.incoming.max,
      fee: tokenDetails.incoming.fee,
      bridgeEnabled: true,
    };
  }

  topUpFromSameNetwork(walletProvider, address, sendAmount) {
    const formattedAmount = utils.parseEther(sendAmount.toString()).toHexString();
    let params = {};

    if (!config.mainToken) {
      params = {
        to: address,
        value: formattedAmount,
      };
    } else {
      const iface = new utils.Interface(erc20Abi);
      const data = iface.encodeFunctionData('transfer', [address, formattedAmount]);
      params = {
        to: config.mainToken,
        data,
      };
    }

    return walletProvider
      .sendRequest('eth_sendTransaction', [
        {
          from: walletProvider.address,
          ...params,
        },
      ])
      .catch(console.error);
  }

  topUpFromAnotherNetwork(topUpContract, walletProvider, address, bridgeAddress, sendAmount, extraData) {
    const formattedAmount = utils.parseEther(sendAmount.toString()).toHexString();
    let params = {};

    const isMultiTokenBridge = topUpContract?.type === BRIDGE_TYPES.MULTI_TOKEN_BRIDGE;
    if (isMultiTokenBridge && this.isMultiTokenBridgeEthTopUp(topUpContract)) {
      const iface = new utils.Interface(topUpContract.abi);
      const data = iface.encodeFunctionData('depositFor', [address]);
      params = {
        to: topUpContract?.bridgeAddress,
        value: formattedAmount,
        data,
      };
    } else if (isMultiTokenBridge && this.isPermisionnedTokenTopUp(topUpContract)) {
      const iface = new utils.Interface(topUpContract.abi);
      const { nonce, signature } = extraData;
      const sig = utils.splitSignature(signature);
      const data = iface.encodeFunctionData('depositWithPermit', [
        topUpContract.tokenAddress,
        formattedAmount,
        address,
        nonce,
        0,
        sig.v,
        sig.r,
        sig.s,
      ]);
      params = {
        to: topUpContract?.bridgeAddress,
        data,
      };
    } else if (isMultiTokenBridge && this.isMultiTokenBridgeRegularTokenTopUp(topUpContract)) {
      const tokenDetails = this.getMultiTokenBridgeTokenDetails(topUpContract);
      const iface = new utils.Interface(erc20Abi);
      const data = iface.encodeFunctionData('transfer', [tokenDetails.incoming.receiverAddress, formattedAmount]);
      params = {
        to: topUpContract?.tokenAddress,
        data,
      };
    } else if (topUpContract?.type === BRIDGE_TYPES.XDAI_BRIDGE) {
      const iface = new utils.Interface(topUpContract.proxyAbi);
      const { nonce, signature } = extraData;
      const sig = utils.splitSignature(signature);
      const data = iface.encodeFunctionData('depositWithPermit', [
        formattedAmount,
        address,
        nonce,
        0,
        sig.v,
        sig.r,
        sig.s,
      ]);
      params = {
        to: topUpContract?.proxyAddress,
        data,
      };
    } else {
      const iface = new utils.Interface(topUpContract.abi);
      const data = iface.encodeFunctionData('transfer', [bridgeAddress, formattedAmount]);
      params = {
        to: topUpContract?.tokenAddress,
        data,
      };
    }

    return walletProvider
      .sendRequest('eth_sendTransaction', [
        {
          from: walletProvider.address,
          ...params,
        },
      ])
      .catch(console.error);
  }

  async registerIntent(topUpContract, sendAmount, fromAddress, destinationAddress) {
    const response = await http.post(
      `${BINANCE_API}/v2/swaps`,
      {
        amount: sendAmount,
        fromNetwork: 'ETH',
        source: 921,
        symbol: topUpContract.currencySymbol,
        toAddress: destinationAddress,
        toAddressLabel: '',
        toNetwork: 'BSC',
        walletAddress: fromAddress,
        walletNetwork: 'ETH',
      },
      { credentials: undefined },
    );
    this.validateDataResponse(response);
    return response.data.data;
  }

  async fetchDepositInfo(depositId) {
    const response = await http.get(`${BINANCE_API}/v2/swaps/${depositId}`, {
      credentials: undefined,
    });
    this.validateDataResponse(response);
    return response.data.data;
  }

  async findDeposit(externalId) {
    return await http.get(`${config.apiUrl}/transaction/find-deposit/${externalId}`).then(({ data }) => data);
  }

  validateDataResponse(response) {
    if (!response?.data?.data) {
      const errorMessage = response?.data?.message;
      throw new Error(errorMessage || 'Unable to fetch info');
    }
  }

  async getTokenPermit(walletProvider, topUpContract) {
    const iface = new utils.Interface(daiAbi);
    const nonce = await walletProvider
      .sendRequest('eth_call', [
        {
          from: walletProvider.address,
          to: topUpContract?.tokenAddress,
          data: iface.encodeFunctionData('nonces', [walletProvider.address]),
        },
      ])
      .then((result) => BigNumber.from(result).toNumber())
      .catch((e) => {
        console.error(e);
        return 0;
      });

    const contractName = this.getPermissionedTokenContractName(topUpContract);
    const spender = this.getPermissionedTokenSpender(topUpContract);
    const data = getDaiPermitData(topUpContract.tokenAddress, contractName, topUpContract.chainId, {
      holder: walletProvider.address,
      spender,
      nonce,
      expiry: 0,
      allowed: true,
    });

    const signature = await walletProvider
      .sendRequest('eth_signTypedData_v4', [walletProvider.address, data]) //
      .catch(console.error);

    return {
      nonce,
      signature,
    };
  }

  getPermissionedTokenContractName(topUpContract = {}) {
    if (topUpContract.type === BRIDGE_TYPES.XDAI_BRIDGE) return 'Dai Stablecoin';
    if (topUpContract.type !== BRIDGE_TYPES.MULTI_TOKEN_BRIDGE) return '';
    const tokenDetails = this.getMultiTokenBridgeTokenDetails(topUpContract);
    return tokenDetails ? tokenDetails.incoming.contactName : '';
  }

  getPermissionedTokenSpender(topUpContract = {}) {
    switch (topUpContract.type) {
      case BRIDGE_TYPES.XDAI_BRIDGE:
        return topUpContract.proxyAddress;
      case BRIDGE_TYPES.MULTI_TOKEN_BRIDGE:
        return topUpContract.bridgeAddress;
    }
    return '';
  }

  isPermisionnedTokenTopUp(topUpContract = {}) {
    if (topUpContract.type === BRIDGE_TYPES.XDAI_BRIDGE) return true;
    if (topUpContract.type !== BRIDGE_TYPES.MULTI_TOKEN_BRIDGE) return false;
    const tokenDetails = this.getMultiTokenBridgeTokenDetails(topUpContract);
    return !!(tokenDetails && !tokenDetails.incoming.nativeToken && tokenDetails.incoming.useBridge);
  }

  isMultiTokenBridgeEthTopUp(topUpContract = {}) {
    if (topUpContract.type !== BRIDGE_TYPES.MULTI_TOKEN_BRIDGE) return false;
    const tokenDetails = this.getMultiTokenBridgeTokenDetails(topUpContract);
    return !!(tokenDetails && tokenDetails.incoming.nativeToken);
  }

  isMultiTokenBridgeRegularTokenTopUp(topUpContract = {}) {
    if (topUpContract.type !== BRIDGE_TYPES.MULTI_TOKEN_BRIDGE) return false;
    const tokenDetails = this.getMultiTokenBridgeTokenDetails(topUpContract);
    return !!(tokenDetails && !tokenDetails.incoming.nativeToken && !tokenDetails.incoming.useBridge);
  }

  getMultiTokenBridgeTokenDetails(topUpContract = {}) {
    return topUpContract.tokens.find(({ incoming }) =>
      addressesEqual(incoming.tokenAddress, topUpContract.tokenAddress),
    );
  }

  async estimateWithdrawal(balance, receiver) {
    if (balance.eq(0)) {
      return BigNumber.from(0);
    }

    const balanceInHex = balance.toHexString();
    const sdkService = this.services.sdkService;

    sdkService.ensureSdkCreated();
    sdkService.sdk.clearGatewayBatch();

    const params = sdkService.getParamsForTokenTransfer(config.mainToken, receiver, balanceInHex);
    await sdkService.sdk.batchExecuteAccountTransaction(params);

    const estimateParams = config.mainToken
      ? {
          refundToken: config.mainToken,
        }
      : undefined;

    const estimated = await sdkService.sdk.estimateGatewayBatch(estimateParams);
    return estimated?.estimation?.refundAmount;
  }

  async withdraw(balance, receiver) {
    const balanceInHex = balance.toHexString();
    const sdkService = this.services.sdkService;

    sdkService.ensureSdkCreated();
    sdkService.sdk.clearGatewayBatch();

    const params = sdkService.getParamsForTokenTransfer(config.mainToken, receiver, balanceInHex);
    await sdkService.sdk.batchExecuteAccountTransaction(params);

    const estimateParams = config.mainToken
      ? {
          refundToken: config.mainToken,
        }
      : undefined;

    await sdkService.sdk.estimateGatewayBatch(estimateParams);
    const transaction = await sdkService.sdk.submitGatewayBatch();

    return transaction;
  }

  async subscribeToTransactionUpdate(hash) {
    const sdkService = this.services.sdkService;
    const batchUpdatedNotification = sdkService.sdk.notifications$.pipe(
      filter(({ type }) => type === NotificationTypes.GatewayBatchUpdated),
      take(2),
    );

    await batchUpdatedNotification.toPromise();
    return sdkService.sdk.getGatewaySubmittedBatch({
      hash,
    });
  }
}

export default BalanceService;
