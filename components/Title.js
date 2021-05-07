import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { animations } from '../utils/animations';
import { hexToRgba } from '../utils/ui';

const getFontSize = (props) => {
  if (props.extraSmall) {
    return '14px';
  } else if (props.small) {
    return '18px';
  } else if (props.big) {
    return '32px';
  } else if (props.large) {
    return '40px';
  }
  return '22px';
};

const getTextShadow = (isSecondary) => {
  const shadow1 = isSecondary ? '#5F0C73' : '#4378A7';
  const shadow2 = isSecondary ? '#D089FE' : '#42A8FA';
  const shadow3 = isSecondary ? '#C637F4' : '#2086CC';

  return `
    1px 0px 2px ${shadow1},
    2px 0px 2px ${shadow2},
    3px 0px 4px ${shadow2},
    2px 0px 3px ${shadow3},
    2px 0px 15px,
    5px 0px 20px,
    20px 0vw 40px ${shadow3},
    20px 0vw 30px ${hexToRgba(shadow3, 0.5)}
  `;
};

const DefaultTitle = styled.h3`
  font-size: ${(props) => getFontSize(props)};
  -webkit-text-stroke: 1px;
  letter-spacing: 5px;
  text-transform: uppercase;
  ${({ mt, ml, mr, mb }) => `margin : ${mt || 0}px ${mr || 0}px ${mb || 0}px ${ml || 0}px`};
`;

const TitleWithNeon = styled.h3`
  font-size: ${(props) => getFontSize(props)};
  -webkit-text-stroke: 1px;
  color: ${({ secondary }) => (secondary ? '#9c13bb' : '#53B5EB')};
  letter-spacing: 5px;
  text-shadow: ${({ secondary }) => getTextShadow(!!secondary)};
  text-transform: uppercase;
  ${({ mt, ml, mr, mb }) => `margin : ${mt || 0}pxpx ${mr || 0}px ${mb || 0}px ${ml || 0}px`};
`;

const Flicker = styled.span`
  animation: ${animations.flicker} cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
  animation-duration: ${({ animationTime }) => (animationTime ? `${animationTime}s` : '1s')};
`;

const getTextWithFlicker = (text, flickerTimes) => {
  const textSymbols = text.split('');
  return textSymbols.reduce((components, symbol, index) => {
    let component;
    const flickerTime = flickerTimes[`item${index}`];
    if (flickerTime) {
      component = (
        <Flicker key={index} animationTime={flickerTime}>
          {symbol}
        </Flicker>
      );
    } else {
      component = symbol;
    }
    components.push(component);
    return components;
  }, []);
};

const Title = (props) => {
  const { text, flickerTimes, secondary } = props;
  if (flickerTimes) {
    const textComponents = getTextWithFlicker(text, flickerTimes);

    return (
      <TitleWithNeon secondary={secondary} {...props}>
        {textComponents}
      </TitleWithNeon>
    );
  }

  return <DefaultTitle {...props}>{text}</DefaultTitle>;
};

Title.propTypes = {
  text: PropTypes.string,
  flickerTimes: PropTypes.object,
  secondary: PropTypes.bool,
};

export default Title;
