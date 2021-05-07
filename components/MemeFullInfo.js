import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { calculatePercentSold, calculateTotalValuation, formatPrice, getShortAddress } from '../utils/ui';
import { memePropType } from '../utils/memes';
import { fontSize } from '../utils/variables';
import { buildAvatarUrl } from '../utils/common';

import MemeInfoPrice from './MemeInfoPrice';
import MemeInfoWrapper, { InfoRow } from './MemeInfoWrapper';
import Button from './Button';

const MemeTitle = styled.h1`
  font-size: ${fontSize.l};
`;

const PercentSold = styled.p`
  font-size: ${fontSize.xs};
  color: #666666;
  margin-bottom: 20px;
`;

const Artist = styled.span`
  display: flex;
  align-items: center;
  text-transform: uppercase;

  & > img {
    height: 1em;
    margin-right: 0.5em;
  }
`;

const DetailsButton = styled(Button).attrs(() => ({
  variant: 'inline',
}))`
  margin-top: 20px;
  margin-bottom: 65px;
`;

const MemeFullInfo = ({ meme, onOpenDetails }) => {
  const showPrice = meme.priceToBuy && meme.priceToBuy !== '0';
  const availableShards = meme.availableShards ?? 0;
  const totalValuation = calculateTotalValuation(meme.maxShards, meme.priceToBuy);
  const percentSold = calculatePercentSold(availableShards, meme.maxShards);

  return (
    <MemeInfoWrapper meme={meme}>
      <MemeTitle>{meme.title}</MemeTitle>
      {!!percentSold && <PercentSold>{percentSold}% sold</PercentSold>}

      {meme.owner && (
        <InfoRow label="Artist">
          <Artist>
            <img src={buildAvatarUrl(meme.owner.avatar)} /> {getShortAddress(meme.owner.address || '')}
          </Artist>
        </InfoRow>
      )}

      {!!totalValuation && <InfoRow label="Total valuation">{formatPrice(totalValuation)}</InfoRow>}
      <InfoRow label="Shards available">
        {availableShards}/{meme.maxShards}
      </InfoRow>

      <DetailsButton onClick={onOpenDetails}>Details</DetailsButton>

      {showPrice && (
        <MemeInfoPrice className="my-auto pb-3" price={meme.priceToBuy} priceChange={meme.memePriceChange} />
      )}
    </MemeInfoWrapper>
  );
};

MemeFullInfo.propTypes = {
  meme: memePropType.isRequired,
  onOpenDetails: PropTypes.func,
};

export default MemeFullInfo;
