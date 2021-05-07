import PropTypes from 'prop-types';
import styled from 'styled-components';

import { fontSize } from '../utils/variables';
import { formatPrice, calculateTotalValuation, calculatePercentSold } from '../utils/ui';
import MemeImage from './MemeImage';
import MemeLink from './MemeLink';
import { IMAGE_TYPES } from '../utils/constants';

const Wrapper = styled.div`
  text-align: center;
  width: 300px;
  font-size: ${fontSize.xs};
  color: #000000;
`;

const Clickable = styled.a`
  &,
  &:hover {
    color: inherit;
    text-decoration: none;
  }

  display: block;
`;

const Image = styled(MemeImage)`
  width: 300px;
  border-radius: 30px;
`;

const Title = styled.h3`
  font-size: ${fontSize.l};
  color: #4478ed;
  margin: 12px 0 18px;
`;

const MemeCard = ({ meme }) => {
  const totalValuation = calculateTotalValuation(meme.maxShards, meme.priceToBuy);
  const percentSold = calculatePercentSold(meme.availableShards, meme.maxShards);
  return (
    <Wrapper>
      <MemeLink memeId={meme._id} passHref>
        <Clickable>
          <Image meme={meme} type={IMAGE_TYPES.THUMB.NAME} />
          <Title>{meme.title}</Title>
          {!!totalValuation && <p>Total valuation: {formatPrice(totalValuation)}</p>}
          {!!percentSold && <p style={{ color: '#666666' }}>{percentSold}% sold</p>}
        </Clickable>
      </MemeLink>
    </Wrapper>
  );
};

MemeCard.propTypes = {
  meme: PropTypes.object,
};

export default MemeCard;
