import { BigNumber } from 'ethers';
import config from '../config';
import { fromWei } from './transactions';

export const hexToRgba = (hex, opacity) => {
  const op = !!opacity && (opacity <= 1 || opacity > 0) ? opacity.toString() : '1';
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${op})`
    : null;
};

export const formatCurrency = (
  value,
  symbol,
  { roundDecimals = true, nonZeroRounding = false, roundUp = false } = {},
) => {
  let template = '';
  const precision = config.displayPrecisions[symbol];

  switch (symbol) {
    case '$':
      template = '[symbol][value]';
      break;
    default:
      template = '[value] [symbol]';
  }

  let formattedValue = value;
  if (precision !== undefined && roundDecimals) {
    formattedValue = numberToFixed(value, precision, roundUp);

    // revert to the initial value if the value became 0 after rounding
    if (nonZeroRounding && Number(value) > 0 && Number(formattedValue) === 0) {
      formattedValue = value.toString();
    }
  }

  return template //
    .replace('[value]', formattedValue)
    .replace('[symbol]', symbol);
};

// avoids rounding up the number
export const numberToFixed = (number, precision, roundUp = false) => {
  let numberAsString = number.toString();
  if (!roundUp && numberAsString.includes('.')) {
    const parts = numberAsString.split('.');
    numberAsString = `${parts[0]}.${parts[1].slice(0, precision)}`;
  }
  return Number(numberAsString).toFixed(precision);
};

export const getShortAddress = (address) => address.substring(2, 8);

export const formatPrice = (priceWei, options) => {
  if (!priceWei) return '';
  return formatCurrency(fromWei(priceWei), config.currencySymbol, options);
};

export const formatFee = (priceWei) => {
  return formatPrice(priceWei, { nonZeroRounding: true, roundUp: true });
};

export const calculateTotalValuation = (maxShards, priceWei) => {
  if (!priceWei || priceWei === '0') return 0;
  const total = BigNumber.from(priceWei).mul(maxShards);
  return total.eq(0) ? 0 : total;
};

export const calculatePercentSold = (availableShards, maxShards) => {
  if (!availableShards) return 0;
  return Math.round(100 * (1 - availableShards / maxShards));
};

export const pluralize = (number, noun, { irregularForm = null, hideNumber = false } = {}) => {
  const pluralized = number === 1 ? noun : irregularForm ?? `${noun}s`;
  return hideNumber ? pluralized : `${number} ${pluralized}`;
};
