const { ethers, providers } = require('ethers');
const BigNumber = require('bignumber.js');
const abiCoder = require('web3-eth-abi');
const moment = require('moment');
const contracts = require('@matoken/contracts');
const config = require('../config');
const { calculateShardsBuyPrice, calculateShardsSellPrice, calculateAvailableShards, toWei } = require('./utils');

const ABI = {
  erc20: contracts.getContractAbi(contracts.ContractNames.ERC20),
  erc1155: contracts.getContractAbi(contracts.ContractNames.ERC1155),
  erc721: contracts.getContractAbi(contracts.ContractNames.ERC721),
  factory: contracts.getContractAbi(contracts.ContractNames.UniswapV2Factory),
  router: contracts.getContractAbi(contracts.ContractNames.UniswapV2Router),
  pair: contracts.getContractAbi(contracts.ContractNames.UniswapV2Pair),
};

const ethProvider = new providers.JsonRpcProvider(config.ETH_PROVIDER);

const transactionParams = {
  gasPrice: '0xa',
  chainId: config.chainId,
};

function formTransactionObj(encodedFunction, to, value = '') {
  return {
    ...transactionParams,
    to,
    value,
    data: encodedFunction,
  };
}

function setDeadline(addMinutes) {
  return Math.round((+new Date() + 1000 * 60 * addMinutes) / 1000);
}

// --------- WRAPPED ERC20 (ERC20) -----------------------

const erc20Abi = ABI.erc20;
const mainTokenContract = config.mainToken ? new ethers.Contract(config.mainToken, erc20Abi, ethProvider) : null;
const erc20ApproveMethod = erc20Abi.find(({ name }) => name === 'approve');

function getApproveBaseTokensForRouterParams() {
  const encodedFunction = abiCoder.encodeFunctionCall(erc20ApproveMethod, [
    config.web3Addresses.router,
    ethers.utils.hexlify(ethers.constants.MaxUint256),
  ]);

  return formTransactionObj(encodedFunction, config.mainToken || config.web3Addresses.weth);
}

async function getUserBalance(address) {
  let balance;
  if (config.mainToken) {
    // get ERC20 token balance
    balance = await mainTokenContract.balanceOf(address);
  } else {
    balance = await ethProvider.getBalance(address);
  }

  return new BigNumber(balance.toString());
}

async function getErc20Allowance(userAddress, spenderAddress) {
  const allowance = await mainTokenContract.allowance(userAddress, spenderAddress);
  return new BigNumber(allowance.toString());
}

// --------- DISPENSER (ERC1155) ------------------

const erc1155Abi = ABI.erc1155;
const erc1155Contract = new ethers.Contract(config.web3Addresses.dispenser, erc1155Abi, ethProvider);
const erc1155ApproveMethod = erc1155Abi.find(({ name }) => name === 'setApprovalForAll');

function getApproveDispenserForRouterParams() {
  const encodedFunction = abiCoder.encodeFunctionCall(erc1155ApproveMethod, [config.web3Addresses.router, true]);

  return formTransactionObj(encodedFunction, config.web3Addresses.dispenser);
}

async function getMemeTokenBalance(memeTokenHash, userAddress) {
  const balance = await erc1155Contract.balanceOf(userAddress, memeTokenHash);
  return new BigNumber(balance.toString());
}

async function getErc1155Allowance(userAddress, spenderAddress) {
  return await erc1155Contract.isApprovedForAll(userAddress, spenderAddress);
}

// --------- MEME MINTER (ERC721) ------------------

const erc721Abi = ABI.erc721;
const erc721MintMethod = erc721Abi.find(({ name }) => name === 'publicMint');

// uniqueId - uint256 unique hex
function getMintMemeParams(userAddress, uniqueId) {
  const encodedFunction = abiCoder.encodeFunctionCall(erc721MintMethod, [userAddress, uniqueId]);

  return formTransactionObj(encodedFunction, config.web3Addresses.memeMinter);
}

const erc721DepositMethod = erc721Abi.find(({ name }) => name === 'safeTransferFrom');

function getDepositMemeParams(userAddress, uniqueId) {
  const encodedFunction = abiCoder.encodeFunctionCall(erc721DepositMethod, [
    userAddress,
    config.web3Addresses.dispenser,
    uniqueId,
  ]);

  return formTransactionObj(encodedFunction, config.web3Addresses.memeMinter);
}

// --------- FACTORY ---------------------

const factoryAbi = ABI.factory;
const factoryContract = new ethers.Contract(config.web3Addresses.factory, factoryAbi, ethProvider);
const factoryCreatePairMethod = factoryAbi.find(({ name }) => name === 'createPair');

function getCreatePairParams(memeTokenHash) {
  const encodedFunction = abiCoder.encodeFunctionCall(factoryCreatePairMethod, [memeTokenHash]);

  return formTransactionObj(encodedFunction, config.web3Addresses.factory);
}

async function getMemePairAddress(memeTokenHash) {
  return await factoryContract.getPair(memeTokenHash);
}

// --------- PAIR ---------------------

const pairAbi = ABI.pair;

async function getReserves(pairAddress) {
  const pairContract = new ethers.Contract(pairAddress, pairAbi, ethProvider);

  let reserves = await pairContract.getReserves();
  if (!reserves || reserves.length === 0) {
    console.error(`Unable to fetch reserves for ${pairAddress}`);
    reserves = [0, 0];
  }

  return {
    memeTokenReserve: new BigNumber(reserves[0].toString()),
    ethReserve: new BigNumber(reserves[1].toString()),
  };
}

const pairApproveMethod = pairAbi.find(({ name }) => name === 'approve');

function getApprovePairTokensForRouterParams(pairAddress) {
  const encodedFunction = abiCoder.encodeFunctionCall(pairApproveMethod, [
    config.web3Addresses.router,
    ethers.utils.hexlify(ethers.constants.MaxUint256),
  ]);

  return formTransactionObj(encodedFunction, pairAddress);
}

async function getOwnerPairNonce(ownerAddress, pairAddress) {
  const pairContract = new ethers.Contract(pairAddress, pairAbi, ethProvider);

  const nonce = await pairContract.nonces(ownerAddress);
  return new BigNumber(nonce.toString());
}

async function getLiquidityTokenBalance(pairAddress, userAddress) {
  const pairContract = new ethers.Contract(pairAddress, pairAbi, ethProvider);
  const balance = await pairContract.balanceOf(userAddress);
  return new BigNumber(balance.toString());
}

async function getPairAllowance(pairAddress, userAddress, spenderAddress) {
  const pairContract = new ethers.Contract(pairAddress, pairAbi, ethProvider);
  const allowance = await pairContract.allowance(userAddress, spenderAddress);
  return new BigNumber(allowance.toString());
}

// --------- ROUTER ---------------------

const routerAbi = ABI.router;
const routerContract = new ethers.Contract(config.web3Addresses.router, routerAbi, ethProvider);

const routerAddLiquidityETHMethod = routerAbi.find(({ name }) => name === 'addLiquidityETH');
function getAddLiquidityETHParams(
  tokenHash,
  memeTokenDeposit,
  ethDeposit,
  memeTokenMinDeposit,
  ethMinDeposit,
  userAddress,
) {
  const deadline = setDeadline(15); // 15min
  const encodedFunction = abiCoder.encodeFunctionCall(routerAddLiquidityETHMethod, [
    tokenHash,
    memeTokenDeposit,
    memeTokenMinDeposit,
    ethMinDeposit,
    userAddress,
    deadline,
  ]);

  return formTransactionObj(encodedFunction, config.web3Addresses.router, ethDeposit);
}

const routerAddLiquidityTokenMethod = routerAbi.find(({ name }) => name === 'addLiquidity');
function getAddLiquidityTokenParams(
  tokenHash,
  memeTokenDeposit,
  baseTokenDeposit,
  memeTokenMinDeposit,
  ethMinDeposit,
  userAddress,
) {
  const deadline = setDeadline(15); // 15min
  const encodedFunction = abiCoder.encodeFunctionCall(routerAddLiquidityTokenMethod, [
    tokenHash,
    memeTokenDeposit,
    baseTokenDeposit,
    memeTokenMinDeposit,
    ethMinDeposit,
    userAddress,
    deadline,
  ]);

  return formTransactionObj(encodedFunction, config.web3Addresses.router);
}

const routerRemoveLiquidityMethod = routerAbi.find(({ name }) => name === 'removeLiquidityGetExactTokensBack');
function getRemoveLiquidityParams(tokenHash, memeTokens, userAddress, returnETH) {
  const deadline = setDeadline(60); // 60min
  const encodedFunction = abiCoder.encodeFunctionCall(routerRemoveLiquidityMethod, [
    tokenHash,
    memeTokens,
    0,
    returnETH,
    userAddress,
    deadline,
  ]);

  return formTransactionObj(encodedFunction, config.web3Addresses.router);
}

const routerSwapExactBaseTokensForTokensMethod = routerAbi.find(({ name }) => name === 'swapExactBaseTokensForTokens');
function getSwapExactBaseTokensForTokensParams(tokenHash, exactEthAmountIn, minTokenAmountOut, userAddress) {
  const deadline = setDeadline(15); // 15min
  const encodedFunction = abiCoder.encodeFunctionCall(routerSwapExactBaseTokensForTokensMethod, [
    exactEthAmountIn,
    minTokenAmountOut,
    tokenHash,
    userAddress,
    deadline,
  ]);

  return formTransactionObj(encodedFunction, config.web3Addresses.router);
}

const routerSwapExactTokensForBaseTokensMethod = routerAbi.find(({ name }) => name === 'swapExactTokensForBaseTokens');
function getSwapExactTokensForBaseTokensParams(tokenHash, exactTokenAmountIn, minEthAmountOut, userAddress) {
  const deadline = setDeadline(15); // 15min
  const encodedFunction = abiCoder.encodeFunctionCall(routerSwapExactTokensForBaseTokensMethod, [
    exactTokenAmountIn,
    minEthAmountOut,
    tokenHash,
    userAddress,
    deadline,
  ]);

  return formTransactionObj(encodedFunction, config.web3Addresses.router);
}

const routerSwapExactTokensForEthMethod = routerAbi.find(({ name }) => name === 'swapExactTokensForETH');
function getSwapExactTokensForEthParams(tokenHash, exactTokenAmountIn, minEthAmountOut, userAddress) {
  const deadline = setDeadline(15); // 15min
  const encodedFunction = abiCoder.encodeFunctionCall(routerSwapExactTokensForEthMethod, [
    exactTokenAmountIn,
    minEthAmountOut,
    tokenHash,
    userAddress,
    deadline,
  ]);

  return formTransactionObj(encodedFunction, config.web3Addresses.router);
}

const routerSwapTokensForExactBaseTokensMethod = routerAbi.find(({ name }) => name === 'swapTokensForExactBaseTokens');
function getSwapTokensForExactBaseTokensParams(tokenHash, exactEthAmountOut, maxTokenAmountIn, userAddress) {
  const deadline = setDeadline(15); // 15min
  const encodedFunction = abiCoder.encodeFunctionCall(routerSwapTokensForExactBaseTokensMethod, [
    exactEthAmountOut,
    maxTokenAmountIn,
    tokenHash,
    userAddress,
    deadline,
  ]);

  return formTransactionObj(encodedFunction, config.web3Addresses.router);
}

const routerSwapBaseTokensForExactTokensMethod = routerAbi.find(({ name }) => name === 'swapBaseTokensForExactTokens');
function getSwapBaseTokensForExactTokensParams(tokenHash, exactTokenAmountOut, maxEthAmountIn, userAddress) {
  const deadline = setDeadline(15); // 15min
  const encodedFunction = abiCoder.encodeFunctionCall(routerSwapBaseTokensForExactTokensMethod, [
    exactTokenAmountOut,
    maxEthAmountIn,
    tokenHash,
    userAddress,
    deadline,
  ]);

  return formTransactionObj(encodedFunction, config.web3Addresses.router);
}

const routerSwapEthForExactTokensMethod = routerAbi.find(({ name }) => name === 'swapETHForExactTokens');
function getSwapEthForExactTokensParams(tokenHash, exactTokenAmountOut, maxEthAmountIn, userAddress) {
  const deadline = setDeadline(15); // 15min
  const encodedFunction = abiCoder.encodeFunctionCall(routerSwapEthForExactTokensMethod, [
    exactTokenAmountOut,
    tokenHash,
    userAddress,
    deadline,
  ]);

  return formTransactionObj(encodedFunction, config.web3Addresses.router, maxEthAmountIn);
}

async function getTokenAmountIn(ethAmountOut, memeTokenHash) {
  const tokenAmountIn = await routerContract.getTokenAmountIn(ethAmountOut, memeTokenHash);
  if (!tokenAmountIn) {
    throw Error('Bad parameters provided');
  }

  return new BigNumber(tokenAmountIn.toString());
}

async function getEthAmountOut(tokenAmountIn, memeTokenHash) {
  const ethAmountOut = await routerContract.getBaseTokenAmountOut(tokenAmountIn, memeTokenHash);
  if (!ethAmountOut) {
    throw Error('Bad parameters provided');
  }

  return new BigNumber(ethAmountOut.toString());
}

async function getEthAmountIn(tokenAmountOut, memeTokenHash) {
  const tokenAmountIn = await routerContract.getBaseTokenAmountIn(tokenAmountOut, memeTokenHash);
  if (!tokenAmountIn) {
    throw Error('Bad parameters provided');
  }

  return new BigNumber(tokenAmountIn.toString());
}

async function quoteAddressLiquidity(memeTokenHash, userAddress) {
  const quote = await routerContract.quoteAddressLiquidity(memeTokenHash, userAddress);
  if (!quote) {
    throw Error('Bad parameters provided');
  }

  return {
    addressLiquidity: new BigNumber(quote.addressLiquidity.toString()),
    tokenAmount: new BigNumber(quote.tokenAmount.toString()),
    baseTokenAmount: new BigNumber(quote.baseTokenAmount.toString()),
  };
}

// --------- UTILS ---------------------

function getMemeTokenHash(memeTokenId) {
  const packedParams = ethers.utils.solidityPack(
    ['address', 'uint256'],
    [config.web3Addresses.memeMinter, memeTokenId],
  );
  return ethers.utils.keccak256(packedParams);
}

async function syncMemeOnchainData(meme, force = false) {
  if (!meme.pairAddress) {
    return meme;
  }

  // NOTE: date now is in ms, while lastSyncTime and timeWindow are in seconds
  const now = new Date();
  const timeWindow = 10 * 60; // 10 min in seconds
  const lastSyncTime = meme.lastSyncTime ? moment(meme.lastSyncTime).unix() : 0;
  const timeWindowPassed = (lastSyncTime + timeWindow) * 1000 < +now;

  if (lastSyncTime && !timeWindowPassed && !force) {
    return meme;
  }

  let reserves;
  try {
    reserves = await getReserves(meme.pairAddress);
  } catch (e) {
    console.error(e);
    return meme;
  }

  const { memeTokenReserve, ethReserve } = reserves;
  const availableShards = calculateAvailableShards(meme.maxShards, memeTokenReserve);

  let priceToBuy = 0;
  let priceToSell = 0;
  if (memeTokenReserve.gt(0) && ethReserve.gt(0) && availableShards > 0) {
    const memeTokens = 1 / meme.maxShards;
    priceToBuy = calculateShardsBuyPrice(toWei(memeTokens), ethReserve, memeTokenReserve);
    priceToSell = calculateShardsSellPrice(toWei(memeTokens), ethReserve, memeTokenReserve);
  }

  meme.availableShards = availableShards;
  meme.memeTokensLiquidity = memeTokenReserve.toString();
  meme.ethLiquidity = ethReserve.toString();
  meme.priceToBuy = priceToBuy.toString();
  meme.priceToSell = priceToSell.toString();
  meme.lastSyncTime = now;

  return await meme.save();
}

module.exports = {
  transactionParams,
  formTransactionObj,
  getApproveBaseTokensForRouterParams,
  getUserBalance,
  getApproveDispenserForRouterParams,
  getMintMemeParams,
  getDepositMemeParams,
  getCreatePairParams,
  getReserves,
  getApprovePairTokensForRouterParams,
  getAddLiquidityETHParams,
  getAddLiquidityTokenParams,
  getRemoveLiquidityParams,
  getLiquidityTokenBalance,
  getSwapExactBaseTokensForTokensParams,
  getSwapExactTokensForBaseTokensParams,
  getSwapBaseTokensForExactTokensParams,
  getSwapTokensForExactBaseTokensParams,
  getSwapExactTokensForEthParams,
  getSwapEthForExactTokensParams,
  getMemeTokenHash,
  getMemeTokenBalance,
  getMemePairAddress,
  getTokenAmountIn,
  getEthAmountIn,
  getEthAmountOut,
  getErc20Allowance,
  getErc1155Allowance,
  getPairAllowance,
  getOwnerPairNonce,
  syncMemeOnchainData,
  quoteAddressLiquidity,
};
