import { utils, BigNumber } from 'ethers';
import { isAddress, prepareAddress } from 'etherspot';
import { buildTypedData } from 'ethers-typed-data-legacy';
import http from './http';
import config from '../config';

export const cancelTransaction = async (transactionGroupId) => {
  try {
    await http.delete(`${config.apiUrl}/transaction-group/${transactionGroupId}`);
    return Promise.resolve();
  } catch (e) {
    console.error(e);
    return Promise.reject(e.message);
  }
};

export const prependAllowanceTransactions = (transactions) => {
  let withAllowanceTxs = [];
  transactions.forEach((transaction) => {
    const allowanceTxs = transaction.allowance || [];
    withAllowanceTxs = [...withAllowanceTxs, ...allowanceTxs, transaction];
  });
  return withAllowanceTxs;
};

export const zeroPad = (str, paddedLength) => {
  const padCount = paddedLength - str.length;
  return padCount > 0 ? `${'0'.repeat(padCount)}${str}` : str;
};

export const fromWei = (wei) => {
  if (!wei) return '';
  return utils.formatEther(wei);
};

export const toWei = (number) => {
  return utils.parseEther(number.toString());
};

export const getTokenDefaultMultiplier = () => {
  return BigNumber.from(10).pow(18);
};

export const weiToShards = (wei, maxShards) => {
  if (!wei || !maxShards) return 0;

  const base = getTokenDefaultMultiplier();
  const str = BigNumber.from(wei)
    .mul(maxShards)
    .div(base)
    .toString();
  const parts = str.split('.');
  return Number(parts[0]);
};

export const shardsToWei = (shards, maxShards) => {
  if (!shards || !maxShards) return BigNumber.from(0);
  shards = Math.floor(Number(shards)); // should be integer
  return toWei(shards / maxShards);
};

const getPermitData = ({ contractAddress, contractName, primaryType, types, chainId }, message) => {
  return JSON.stringify(
    buildTypedData(
      {
        name: contractName,
        version: '1',
        chainId,
        verifyingContract: contractAddress,
      },
      primaryType,
      types,
      message,
    ),
  );
};

export const getDaiPermitData = (contractAddress, contractName, chainId, message) => {
  const daiPermitType = [
    {
      name: 'holder',
      type: 'address',
    },
    {
      name: 'spender',
      type: 'address',
    },
    {
      name: 'nonce',
      type: 'uint256',
    },
    {
      name: 'expiry',
      type: 'uint256',
    },
    {
      name: 'allowed',
      type: 'bool',
    },
  ];

  return getPermitData(
    {
      contractAddress,
      contractName,
      primaryType: 'Permit',
      types: daiPermitType,
      chainId,
    },
    message,
  );
};

export const addressesEqual = (address1 = '', address2 = '') => {
  return (address1 || '').toLowerCase() === (address2 || '').toLowerCase();
};

export const isValidAddress = (address) => {
  return isAddress(prepareAddress(address));
};
