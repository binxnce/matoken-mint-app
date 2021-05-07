import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, OverlayTrigger, Tooltip, CloseButton } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { isLoggedInSelector } from '../redux/selectors';
import { weiToShards } from '../utils/transactions';
import { hasLiquidity } from '../utils/memes';
import useMemeOwnership from '../hooks/useMemeOwnership';
import { fontSize, fontWeight } from '../utils/variables';

import Card from './Card';
import { SellButton, BuyButton } from './TradeButtons';
import SmallTradeForm, { TRADE_TYPE } from './SmallTradeForm';
import { OpenLoginModalContext } from './LoginModal';
import PostPurchaseModal from './PostPurchaseModal';
import PostSaleModal from './PostSaleModal';

const OuterWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
`;

// in order to avoid bugs where MainCard content covers trade popup, stacking
// contexts of both cards are separated by setting position relative/absolute
// and z-index on MainCard and PopupWrapper

const MainCard = styled(Card)`
  flex: 1;
  position: relative;
  z-index: 0;
`;

const PopupWrapper = styled.div`
  position: absolute;
  z-index: 1;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  display: flex;
  flex-direction: column;
`;

const PopupOverlay = styled.div`
  flex-basis: 0;
  flex-grow: 1;
`;

const InnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
`;

const TradeButtonRow = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 10px;
`;

const ConnectPrompt = styled.div`
  display: flex;
  flex-direction: column;
  margin: 1em -${Card.PADDING} -${Card.PADDING} -${Card.PADDING};
  padding: ${Card.PADDING};
  background: hsl(0, 0%, 85%);
`;

export const FullWidthContent = styled.div`
  margin: auto -${Card.PADDING};
`;

const InfoRowWrapper = styled.div`
  display: flex;
  margin-bottom: 0.5em;
  font-size: ${fontSize.xxs};
  font-weight: ${fontWeight.regular};
`;

const InfoRowLabel = styled.span`
  margin-right: auto;
`;

const StyledTooltip = styled(Tooltip)`
  &.show {
    opacity: 1;
  }

  .arrow::before {
    border-top-color: white;
  }

  .tooltip-inner {
    background-color: white;
    padding: 15px;
    box-shadow: 0 6px 25px 0 rgba(0, 0, 0, 0.2);
    border-radius: 17px;
    color: #000000;
    font-size: ${fontSize.xs};
    font-weight: ${fontWeight.bold};
  }
`;

export const InfoRow = ({ label, children }) => (
  <InfoRowWrapper>
    <InfoRowLabel>{label}</InfoRowLabel>
    {children}
  </InfoRowWrapper>
);

InfoRow.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const MemeInfoWrapper = ({ meme, children }) => {
  const memeId = meme._id;
  const isLoggedIn = useSelector(isLoggedInSelector);
  const ownership = useMemeOwnership(memeId);

  const [visiblePopup, setVisiblePopup] = useState(null);
  const openLoginModal = useContext(OpenLoginModalContext);

  const [postPurchaseModalInfo, setPostPurchaseModalInfo] = useState({ show: false });
  const [isPostSaleModalShown, setIsPostSaleModalShown] = useState(false);

  const handleSuccess = ({ type, shards }) => {
    if (type === TRADE_TYPE.BUY) {
      setPostPurchaseModalInfo({
        show: true,
        boughtShards: shards,
      });
    }

    if (type === TRADE_TYPE.SELL) {
      setIsPostSaleModalShown(true);
    }

    setVisiblePopup(null);
  };

  return (
    <OuterWrapper>
      <MainCard>
        <InnerWrapper>
          {children}

          {hasLiquidity(meme) &&
            (isLoggedIn ? (
              <TradeButtonRow>
                {ownership?.memeTokens && (
                  <OverlayTrigger
                    overlay={
                      <StyledTooltip>You own {weiToShards(ownership.memeTokens, meme.maxShards)} shards</StyledTooltip>
                    }
                  >
                    <SellButton onClick={() => setVisiblePopup(TRADE_TYPE.SELL)}>Sell</SellButton>
                  </OverlayTrigger>
                )}
                {meme.availableShards > 0 && <BuyButton onClick={() => setVisiblePopup(TRADE_TYPE.BUY)}>Buy</BuyButton>}
              </TradeButtonRow>
            ) : (
              <ConnectPrompt>
                <span>To start, connect your wallet</span>
                <Button className="mt-2" onClick={openLoginModal}>
                  Connect
                </Button>
              </ConnectPrompt>
            ))}
        </InnerWrapper>
      </MainCard>
      {visiblePopup !== null && (
        <PopupWrapper>
          <PopupOverlay onClick={() => setVisiblePopup(null)} />
          <Card>
            <CloseButton className="mb-3" onClick={() => setVisiblePopup(null)} />
            <SmallTradeForm type={visiblePopup} meme={meme} onSuccess={handleSuccess} />
          </Card>
        </PopupWrapper>
      )}
      <PostPurchaseModal
        show={postPurchaseModalInfo.show}
        onHide={() => setPostPurchaseModalInfo({ show: false })}
        meme={meme}
        boughtShards={postPurchaseModalInfo.boughtShards}
      />
      <PostSaleModal show={isPostSaleModalShown} onHide={() => setIsPostSaleModalShown(false)} />
    </OuterWrapper>
  );
};

MemeInfoWrapper.propTypes = {
  meme: PropTypes.object.isRequired,
  children: PropTypes.node,
};

export default MemeInfoWrapper;
