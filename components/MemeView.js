import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Row, Col } from 'react-bootstrap';

import { memePropType } from '../utils/memes';

import MemeImage from './MemeImage';
import MemeFullInfo from './MemeFullInfo';
import MemePriceDetails from './MemePriceDetails';
import MemeLink from './MemeLink';
import MemeDetails from './MemeDetails';
import Button from './Button';
import Card from './Card';

const MemeFullImage = styled(MemeImage)`
  width: 620px;
`;

const ListNavButtons = styled.div`
  display: grid;
  grid-template: 'left right' auto / 1fr 1fr;
  grid-gap: 10px;
  margin-top: 30px;
`;

const ListNavButton = styled(Button).attrs(() => ({
  variant: 'navigation',
}))`
  text-align: ${({ align }) => align};
  grid-area: ${({ align }) => align};
  span {
    margin: 0 10px;
  }
`;

const MemeView = ({ meme, nextMemeId, prevMemeId }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <Row>
        <Col sm={8}>
          {showDetails ? (
            <MemeDetails meme={meme} onClose={() => setShowDetails(false)} />
          ) : (
            <Card noPadding>
              <MemeFullImage meme={meme} isPlaceholderActive={false} />
            </Card>
          )}
        </Col>
        <Col sm={4}>
          {showDetails ? (
            <MemePriceDetails meme={meme} />
          ) : (
            <MemeFullInfo meme={meme} onOpenDetails={() => setShowDetails(true)} />
          )}
          <ListNavButtons>
            {prevMemeId && (
              <MemeLink memeId={prevMemeId}>
                <ListNavButton align="left">
                  <i className="fas fa-arrow-left"></i> <span>Prev</span>
                </ListNavButton>
              </MemeLink>
            )}
            {nextMemeId && (
              <MemeLink memeId={nextMemeId}>
                <ListNavButton align="right">
                  <span>Next</span> <i className="fas fa-arrow-right"></i>
                </ListNavButton>
              </MemeLink>
            )}
          </ListNavButtons>
        </Col>
      </Row>
    </>
  );
};

MemeView.propTypes = {
  meme: memePropType.isRequired,
  nextMemeId: PropTypes.string,
  prevMemeId: PropTypes.string,
};

export default MemeView;
