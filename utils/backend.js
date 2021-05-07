const { Validator } = require('jsonschema');
const BigNumber = require('bignumber.js');
const fs = require('fs').promises;
const {
  Contract,
  utils: { formatEther, parseEther },
} = require('ethers');
// const Sequence = require('../models/Sequence');
const AUTH_TYPES = {
  WALLET_CONNECT: 'WalletConnect',
  METAMASK: 'MetaMask',
  TORUS: 'Torus',
};

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

async function getNextId(name = 'memes') {
  // const doc = await Sequence.findOneAndUpdate({ name }, { $inc: { value: 1 } }, { new: true, upsert: true });
  let doc;
  return doc.value;
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

module.exports = {
  ZERO_ADDRESS: `0x${'0'.repeat(40)}`,
  validateJson,
  getTokenDefaultMultiplier,
  calculateAvailableShards,
  calculateShardsBuyPrice,
  calculateShardsSellPrice,
  fromWei,
  toWei,
  toBigNumber,
  hexFromBigNumber,
  filterResultData,
  safeUnlink,
  getNextId,
  isValidAuthType,
  getDefaultAuthType,
  parseContractLogs,
  addressesEqual,
};
