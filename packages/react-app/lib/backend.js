const {
  getMintMemeParams,
  getDepositMemeParams,
  getCreatePairParams,
  getAddLiquidityETHParams,
  getAddLiquidityTokenParams,
  getRemoveLiquidityParams,
  getSwapEthForExactTokensParams,
  getSwapExactTokensForEthParams,
  getSwapExactTokensForBaseTokensParams,
  getSwapBaseTokensForExactTokensParams,
  quoteAddressLiquidity,
} = require('./trading');
const config = require('../config');

async function createMemeTransactions(userId, memeId, memeUniqueId, memeTokenHash, userAddress) {
  const mintMemeParams = getMintMemeParams(userAddress, memeUniqueId);
  const depositMemeParams = getDepositMemeParams(userAddress, memeUniqueId);

  const createPairParams = getCreatePairParams(memeTokenHash);
}

async function addLiquidityTransactions(
  userId,
  memeId,
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
      spenderAddress: config.web3Addresses.router,
      contractAddress: config.mainToken,
      contractType: CONTRACT_TYPE.ERC20,
    });
  }
}

async function removeLiquidityTransactions(userId, memeId, memeTokenHash, pairAddress, memeTokens, senderAddress) {
  const returnETH = !config.mainToken;
  const removeLiquidityParams = getRemoveLiquidityParams(memeTokenHash, memeTokens, senderAddress, returnETH);
}

async function removeLiquidityFromAllMemesTransactions(userId, memes, senderAddress) {
  const returnETH = !config.mainToken;
  for (const meme of memes) {
    const liquidity = await quoteAddressLiquidity(meme.tokenHash, senderAddress);
    const removeLiquidityParams = getRemoveLiquidityParams(
      meme.tokenHash,
      liquidity.tokenAmount,
      senderAddress,
      returnETH,
    );
  }
}

async function sellMemeTokensTransactions(userId, memeId, memeTokenHash, exactMemeTokensIn, ethMinOut, senderAddress) {
  // check allowance weth/dispenser -> router

  const ethAsMainToken = !config.mainToken;
  const params = ethAsMainToken
    ? getSwapExactTokensForEthParams(memeTokenHash, exactMemeTokensIn, ethMinOut, senderAddress)
    : getSwapExactTokensForBaseTokensParams(memeTokenHash, exactMemeTokensIn, ethMinOut, senderAddress);

  const mainTokenAllowance = [];
  if (!ethAsMainToken) {
    mainTokenAllowance.push({
      spenderAddress: config.web3Addresses.router,
      contractAddress: config.mainToken,
      contractType: CONTRACT_TYPE.ERC20,
    });
  }

}

async function buyMemeTokensTransactions(userId, memeId, memeTokenHash, exactTokensOut, maxEthIn, senderAddress) {
  // check allowance weth/dispenser -> router

  const ethAsMainToken = !config.mainToken;
  const params = ethAsMainToken
    ? getSwapEthForExactTokensParams(memeTokenHash, exactTokensOut, maxEthIn, senderAddress)
    : getSwapBaseTokensForExactTokensParams(memeTokenHash, exactTokensOut, maxEthIn, senderAddress);

  const mainTokenAllowance = [];
  if (!ethAsMainToken) {
    mainTokenAllowance.push({
      spenderAddress: config.web3Addresses.router,
      contractAddress: config.mainToken,
      contractType: CONTRACT_TYPE.ERC20,
    });
  }
}

module.exports = {
  createMemeTransactions,
  addLiquidityTransactions,
  removeLiquidityTransactions,
  removeLiquidityFromAllMemesTransactions,
  sellMemeTokensTransactions,
  buyMemeTokensTransactions,
};
