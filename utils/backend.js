const BigNumber = require('bignumber.js');
const fs = require('fs').promises;
const {
  ethers, 
  providers,
  Contract,
  utils: { formatEther, parseEther },
} = require('ethers');
const abiCoder = require('web3-eth-abi');
const moment = require('moment');
const config = require('../config');
const {getContractAbi, getContractAddress, ContractNames} = require('@matoken/contracts');
// const Sequence = require('../models/Sequence');
const AUTH_TYPES = {
  WALLET_CONNECT: 'WalletConnect',
  METAMASK: 'MetaMask',
  TORUS: 'Torus',
};
const chainId = 80001;

const ABI = {
  erc20: getContractAbi(ContractNames.WrappedERC20),
  erc1155: getContractAbi(ContractNames.ERC1155),
  erc721: getContractAbi(ContractNames.ERC721),
  factory: getContractAbi(ContractNames.UniswapV2Factory),
  router: getContractAbi(ContractNames.UniswapV2Router),
  pair: getContractAbi(ContractNames.UniswapV2Pair),
  bFactory: getContractAbi(ContractNames.BFactory),
  bPool: getContractAbi(ContractNames.BPool),
};

const web3Addresses = {
    dispenser: getContractAddress(ContractNames.ERC1155,chainId),
    weth: getContractAddress(ContractNames.WrappedERC20,chainId),
    memeMinter: getContractAddress(ContractNames.ERC721,chainId),
    factory: getContractAddress(ContractNames.UniswapV2Factory,chainId),
    router: getContractAddress(ContractNames.UniswapV2Router,chainId),
    bFactory: getContractAddress(ContractNames.BFactory,chainId),
};
const ethProvider = new providers.JsonRpcProvider(config.ethProvider);


function getTokenDefaultMultiplier() {
  return new BigNumber(10).pow(18);
}

// NOTE: because of the uniswap logic it's not possible to acquire 100% of shards, maximum 99.999999%
// for simplicity we're reducing the total available amount by 1
function calculateAvailableShards(maxShards, memeTokenReserve) {
  if (!memeTokenReserve) return 0;

  const base = getTokenDefaultMultiplier();
  const inPool = Number(
    memeTokenReserve
      .times(maxShards)
      .dividedBy(base)
      .toFixed(0, 1), // ROUND_DOWN
  );
  const availableShards = inPool - 1;
  return availableShards > 0 ? availableShards : 0;
}

function calculateShardsBuyPrice(shardsToBuy, ethLiquidity, memeTokensLiquidity) {
  const numerator = ethLiquidity.multipliedBy(shardsToBuy).multipliedBy(1000);
  const denominator = memeTokensLiquidity.minus(shardsToBuy).multipliedBy(997);
  const price = numerator
    .div(denominator)
    .plus(1)
    .toFixed(0, BigNumber.ROUND_DOWN);
  return new BigNumber(price);
}

function calculateShardsSellPrice(shardsToSell, ethLiquidity, memeTokensLiquidity) {
  const amountInWithFee = shardsToSell.multipliedBy(997);
  const numerator = amountInWithFee.multipliedBy(ethLiquidity);
  const denominator = memeTokensLiquidity.multipliedBy(1000).plus(amountInWithFee);
  const price = numerator.div(denominator).toFixed(0, BigNumber.ROUND_DOWN);
  return new BigNumber(price);
}

function fromWei(number) {
  return formatEther(number);
}

function toWei(number) {
  const inWei = parseEther(number.toString());
  return new BigNumber(inWei.toString());
}

function toBigNumber(number) {
  return new BigNumber(number.toString());
}

function hexFromBigNumber(numberBN) {
  return `0x${numberBN.toString(16)}`;
}

function filterResultData(data, allowedFields) {
  return allowedFields.reduce(
    (memo, field) => ({
      ...memo,
      [field]: data[field],
    }),
    {},
  );
}

async function safeUnlink(path) {
  try {
    await fs.unlink(path);
  } catch (e) {
    console.error(e);
  }
}

function isValidAuthType(type) {
  return Object.values(AUTH_TYPES).includes(type);
}

function getDefaultAuthType() {
  return AUTH_TYPES.METAMASK;
}

function parseContractLogs(logs, contractData) {
  const contract = new Contract(contractData.address, contractData.abi);
  return logs
    .map((log) => {
      try {
        return contract.interface.parseLog(log);
      } catch (e) {
        //
      }
      return null;
    })
    .filter(Boolean);
}

function addressesEqual(address1 = '', address2 = '') {
  return (address1 || '').toLowerCase() === (address2 || '').toLowerCase();
}

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
    web3Addresses.router,
    ethers.utils.hexlify(ethers.constants.MaxUint256),
  ]);

  return formTransactionObj(encodedFunction, config.mainToken || web3Addresses.weth);
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
const erc1155Contract = new ethers.Contract(web3Addresses.dispenser, erc1155Abi, ethProvider);
const erc1155ApproveMethod = erc1155Abi.find(({ name }) => name === 'setApprovalForAll');

function getApproveDispenserForRouterParams() {
  const encodedFunction = abiCoder.encodeFunctionCall(erc1155ApproveMethod, [web3Addresses.router, true]);

  return formTransactionObj(encodedFunction, web3Addresses.dispenser);
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

  return formTransactionObj(encodedFunction, web3Addresses.memeMinter);
}

const erc721DepositMethod = erc721Abi.find(({ name }) => name === 'safeTransferFrom');

function getDepositMemeParams(userAddress, uniqueId) {
  const encodedFunction = abiCoder.encodeFunctionCall(erc721DepositMethod, [
    userAddress,
    web3Addresses.dispenser,
    uniqueId,
  ]);

  return formTransactionObj(encodedFunction, web3Addresses.memeMinter);
}

// --------- FACTORY ---------------------

const factoryAbi = ABI.factory;
const factoryContract = new ethers.Contract(web3Addresses.factory, factoryAbi, ethProvider);
const factoryCreatePairMethod = factoryAbi.find(({ name }) => name === 'createPair');

function getCreatePairParams(memeTokenHash) {
  const encodedFunction = abiCoder.encodeFunctionCall(factoryCreatePairMethod, [memeTokenHash]);

  return formTransactionObj(encodedFunction, web3Addresses.factory);
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
    web3Addresses.router,
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
const routerContract = new ethers.Contract(web3Addresses.router, routerAbi, ethProvider);

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

  return formTransactionObj(encodedFunction, web3Addresses.router, ethDeposit);
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

  return formTransactionObj(encodedFunction, web3Addresses.router);
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

  return formTransactionObj(encodedFunction, web3Addresses.router);
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

  return formTransactionObj(encodedFunction, web3Addresses.router);
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

  return formTransactionObj(encodedFunction, web3Addresses.router);
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

  return formTransactionObj(encodedFunction, web3Addresses.router);
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

  return formTransactionObj(encodedFunction, web3Addresses.router);
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

  return formTransactionObj(encodedFunction, web3Addresses.router);
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

  return formTransactionObj(encodedFunction, web3Addresses.router, maxEthAmountIn);
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
// ---------Balancer--------------------
const bPoolAbi = ABI.bPool;

const bindMethod = bPoolAbi.find(({name}) => name === 'bind');
function getBind(bPoolAddress, tokenAddress, balance, denorm) {
    const encodedFunction = abiCoder.encodeFunctionCall(bindMethod,[tokenAddress,balance,denorm]);
    return formTransactionObj(encodedFunction, bPoolAddress);
}

const setPublicSwap = bPoolAbi.find(({name}) => name === 'setPublicSwap');
function getSetPublicSwap(bPoolAddress, status) {
    const encodedFunction = abiCoder.encodeFunctionCall(setPublicSwap,[status]);
    return formTransactionObj(encodedFunction,bPoolAddress);
}

const swapExactAmountIn = bPoolAbi.find(({name}) => name === 'swapExactAmountIn');
function getSwapExactAmountIn(bPoolAddress,tokenIn, tokenAmtIn, tokenOut, minAmtOut, maxPrice) {
    const encodedFunction = abiCoder.encodeFunctionCall(
        swapExactAmountIn,
        [tokenIn,tokenAmtIn,minAmtOut,maxPrice]
    );
    return formTransactionObj(encodedFunction, bPoolAddress);
}

// --------- UTILS ---------------------

function getMemeTokenHash(memeTokenId) {
  const packedParams = ethers.utils.solidityPack(
    ['address', 'uint256'],
    [web3Addresses.memeMinter, memeTokenId],
  );
  return ethers.utils.keccak256(packedParams);
}

async function getMemeNextId() {
  const erc721Contract = new ethers.Contract(config.contracts.ERC721.address, erc721Abi, ethProvider);

  const numTokens = await erc721Contract.balanceOf(web3Addresses.dispenser);
  let nextId = 1;
  if (numTokens.toNumber() > 0) {
    const lastId = await erc721Contract.tokenOfOwnerByIndex(web3Addresses.dispenser, numTokens.toNumber() - 1);
    nextId = lastId.toNumber() + 1;
  }
  return nextId;
}

// FUNCTIONS TO CREATE MEMES, ADD/REMOVE LIQUIDITY
async function createMemeTransactions(memeUniqueId, memeTokenHash, userAddress) {
    const mintMemeParams = getMintMemeParams(userAddress, memeUniqueId);
    const depositMemeParams = getDepositMemeParams(userAddress, memeUniqueId);
  
    const createPairParams = getCreatePairParams(memeTokenHash);
  
    const transactionQueue = [
      {
        params: mintMemeParams,
        type: TRANSACTION_TYPE.MINT,
      },
      {
        params: depositMemeParams,
        type: TRANSACTION_TYPE.TRANSFER,
      },
      {
        params: createPairParams,
        type: TRANSACTION_TYPE.CREATE_PAIR,
      },
    ];

    return transactionQueue;
  }
  
  async function addLiquidityTransactions(
    memeTokenHash,
    memeTokenDeposit,
    ethDeposit,
    memeTokenMinDeposit,
    ethMinDeposit,
    userAddress,
  ) {
    let addLiquidityParams;
    const ethAsMainToken = !config.mainToken;
  
    if (ethAsMainToken) {
      addLiquidityParams = getAddLiquidityETHParams(
        memeTokenHash,
        memeTokenDeposit,
        ethDeposit,
        memeTokenMinDeposit,
        ethMinDeposit,
        userAddress,
      );
    } else {
      addLiquidityParams = getAddLiquidityTokenParams(
        memeTokenHash,
        memeTokenDeposit,
        ethDeposit,
        memeTokenMinDeposit,
        ethMinDeposit,
        userAddress,
      );
    }
  
    const mainTokenAllowance = [];
    if (!ethAsMainToken) {
      mainTokenAllowance.push({
        spenderAddress: web3Addresses.router,
        contractAddress: config.mainToken,
        contractType: CONTRACT_TYPE.ERC20,
      });
    }
  
    const transactionQueue = [
      {
        params: addLiquidityParams,
        type: TRANSACTION_TYPE.ADD_LIQUIDITY,
        allowance: [
          ...mainTokenAllowance,
          {
            spenderAddress: web3Addresses.router,
            contractAddress: web3Addresses.dispenser,
            contractType: CONTRACT_TYPE.ERC1155,
          },
        ],
      },
    ];
  
    return transactionQueue;
  }
  
  async function removeLiquidityTransactions(userId, memeId, memeTokenHash, pairAddress, memeTokens, senderAddress) {
    const returnETH = !config.mainToken;
    const removeLiquidityParams = getRemoveLiquidityParams(memeTokenHash, memeTokens, senderAddress, returnETH);
    const transactionQueue = [
      {
        params: removeLiquidityParams,
        type: TRANSACTION_TYPE.REMOVE_LIQUIDITY,
        allowance: [
          {
            spenderAddress: web3Addresses.router,
            contractAddress: pairAddress,
            contractType: CONTRACT_TYPE.PAIR,
          },
        ],
      },
    ];
  
    return transactionQueue;
  }