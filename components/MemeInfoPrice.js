import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { BigNumber } from 'ethers';
import moment from 'moment';

import { formatPrice, formatCurrency } from '../utils/ui';
import { fromWei } from '../utils/transactions';
import config from '../config';
import { fontSize, fontWeight } from '../utils/variables';

export const BigPrice = styled.span`
  font-size: ${fontSize.xxl};
  font-weight: ${fontWeight.bold};
`;

const PriceChange = styled.div`
  font-size: ${fontSize.xxs};
  font-weight: ${fontWeight.regular};
  text-align: center;
`;

const PriceChangeValue = styled.p`
  ${({ sign }) => sign === '+' && 'color: green'};
  ${({ sign }) => sign === '-' && 'color: red'};
`;

const MemeInfoPrice = ({ price, className = '', priceChange }) => {
  const { changeSign, valueChange, percentChange, percentChangeFormatted, periodChange } = useMemo(() => {
    if (!priceChange) return {};

    const currentPrice = BigNumber.from(price);
    const prevPrice = BigNumber.from(priceChange.price);
    const changeSign = currentPrice.gt(prevPrice) ? '+' : '-';

    const precision = config.displayPrecisions[config.currencySymbol] || 0;
    let diff = Number(
      Number(
        fromWei(currentPrice.sub(prevPrice).abs()), //
      ).toFixed(precision),
    );
    let percent = prevPrice.eq(0)
      ? 0
      : currentPrice
          .mul(100)
          .div(prevPrice)
          .sub(100)
          .abs()
          .toNumber();
    if (percent > 1) percent = percent.toFixed(0);

    const valueChange = diff > 0 ? `${changeSign} ${formatCurrency(diff, config.currencySymbol)}` : '';
    const daysDiff = moment().diff(priceChange.createdAt, 'days');
    const periodChange = daysDiff <= 1 ? '24 hours' : `${daysDiff} days`;

    return {
      changeSign, //
      valueChange,
      percentChange: percent,
      percentChangeFormatted: `${changeSign}${percent}%`,
      periodChange,
    };
  }, [priceChange, price]);

  return (
    <div className={`d-flex flex-column align-items-center ${className}`}>
      <div className="d-flex align-items-center justify-content-between">
        <BigPrice>{formatPrice(price)}</BigPrice>
      </div>
      {!!priceChange && !!percentChange && (
        <PriceChange>
          <PriceChangeValue sign={changeSign}>
            {valueChange} ({percentChangeFormatted})
          </PriceChangeValue>
          <p>{periodChange}</p>
        </PriceChange>
      )}
    </div>
  );
};

MemeInfoPrice.propTypes = {
  price: PropTypes.string.isRequired,
  priceChange: PropTypes.shape({
    price: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
  }),
  className: PropTypes.string,
};

export default MemeInfoPrice;
