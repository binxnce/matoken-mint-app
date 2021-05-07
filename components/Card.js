import { Card as BootstrapCard } from 'react-bootstrap';
import styled from 'styled-components';
import React from 'react';
import PropTypes from 'prop-types';
import { colors } from '../utils/variables';
import { animations } from '../utils/animations';

const CardWrapper = styled(BootstrapCard)`
  && {
    border-radius: 40px;
    border: 0;

    &:before {
      display: block;
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      border-radius: 40px;
      box-shadow: 0 6px 25px 0 ${({ shadowColor }) => shadowColor ?? 'rgba(0, 0, 0, 0.2)'};
      animation: ${animations.flicker} cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
      animation-duration: ${({ animationTime }) => (animationTime ? `${animationTime}s` : '0s')};
      z-index: 1;
    }
  }
`;

const PADDING = '35px';

const CardContent = styled(BootstrapCard.Body)`
  position: relative;
  z-index: 2;
  border-radius: 40px;
  overflow: hidden;
  min-height: 100%;
  padding: ${({ $noPadding }) => ($noPadding ? 0 : PADDING)};
  background-color: ${colors.card};
`;

const Card = (props) => {
  const { children, bodyWrapperStyle, noPadding = false, ...rest } = props;

  return (
    <CardWrapper {...rest}>
      <CardContent style={bodyWrapperStyle} $noPadding={noPadding}>
        {children}
      </CardContent>
    </CardWrapper>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  bodyWrapperStyle: PropTypes.object,
  noPadding: PropTypes.bool,
};

Card.PADDING = PADDING;

export default Card;
