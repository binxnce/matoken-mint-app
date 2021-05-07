import moment from 'moment';
import config from '../config';

export const isObject = (value) => typeof value === 'object' && value !== null;

export const calculateShardsBuyPrice = (shardsToBuy, ethLiquidity, memeTokensLiquidity) => {
  const numerator = ethLiquidity.mul(shardsToBuy).mul(1000);
  const denominator = memeTokensLiquidity.sub(shardsToBuy).mul(997);
  const price = numerator
    .div(denominator)
    .add(1)
    .toString();
  return price.split('.')[0];
};

export const calculateSecondsLeft = (expirationTime) => {
  return moment(expirationTime)
    .utc(true)
    .diff(moment().utc(true), 'seconds');
};

export const buildAvatarUrl = (avatar) => {
  if (avatar.filename) {
    return config.storageUrl + avatar.link;
  } else {
    return avatar.link;
  }
};

export const getBaseUrl = () => {
  const { protocol, hostname, port } = window.location;
  return `${protocol}//${hostname}${port !== '' ? `:${port}` : ''}`;
};

export const parseJson = (data) => {
  let result;
  try {
    result = JSON.parse(data);
  } catch (e) {
    //
  }
  return result;
};
