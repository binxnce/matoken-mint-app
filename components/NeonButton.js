import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Link from 'next/link';

import { animations } from '../utils/animations';
import { colors } from '../utils/variables';
import { hexToRgba } from '../utils/ui';

const getPadding = (props) => {
  if (props.big) return '8px 20px';
  if (props.small) return '4px 10px';
  return '8px 12px';
};

const commonStyle = (props) => `
  cursor: pointer;
  padding: ${getPadding(props)};
  display: ${props.block ? 'block' : 'inline-block'};
  transition: all 1s;
  background: transparent;
  border-radius: 8px;
  line-height: 1;
  text-align: center;
`;

const Clickable = styled.a`
  text-decoration: none;
  display: inline-block;
`;

const ButtonWrapper = styled.div`
  ${(props) => commonStyle(props)}
  border: 2px solid ${colors.secondaryText};
  transition: all 1s;
  ${({ disabled }) => disabled && 'cursor: not-allowed;'}

  &:hover {
    box-shadow: ${({ disabled }) =>
      !disabled ? '0 0 10px -1px ${colors.secondaryText}, 0 0 10px -1px ${colors.secondaryText} inset' : 'none'};
  }
`;

const FlickeringButtonWrapper = styled.div`
  ${(props) => commonStyle(props)}
  border: ${({ neonColor }) => `2px solid ${hexToRgba(neonColor, 0.5)};`}

  &:hover {
    animation: ${({ neonColor }) => animations.blinkAndLightOn(neonColor)} 2s linear forwards;

    em {
      animation: ${animations.textFlickering} 2s linear forwards;
      font-style: normal;

      span {
        animation: ${animations.letterFlickering} 4s linear infinite;
      }
    }
  }
`;

const ButtonText = styled.span`
  color: ${colors.text};
  font-size: ${({ small }) => (small ? '12px' : '14px')};
  ${({ small }) => small && 'height: 12px; line-height: 1;'};
  font-wight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;

  & em {
    font-style: normal;
  }
`;

const Flicker = styled.span`
  color: ${colors.mainDark};
`;

const getTextWithFlicker = (props) => {
  const { text, flickerIndex } = props;
  if (flickerIndex || flickerIndex === 0) {
    const textSymbols = text.split('');
    const allComponents = textSymbols.reduce((components, symbol, index) => {
      let component;
      if (index === flickerIndex) {
        component = (
          <Flicker key={index} {...props}>
            {symbol}
          </Flicker>
        );
      } else {
        component = symbol;
      }
      components.push(component);
      return components;
    }, []);

    return <em>{allComponents}</em>;
  }
  return text;
};

const getNeonColor = (props) => {
  if (props.main) {
    return colors.main;
  } else if (props.secondary) {
    return colors.secondary;
  } else if (props.tertiary) {
    return colors.tertiaryButton;
  } else if (props.danger) {
    return colors.error;
  }
  return null;
};

const ButtonContent = (props) => {
  const { text, disabled, flickerIndex, small } = props;
  const neonColor = getNeonColor(props);
  let flickeringText;

  if (flickerIndex || flickerIndex === 0) flickeringText = getTextWithFlicker(props);

  if (neonColor && !disabled) {
    return (
      <FlickeringButtonWrapper {...props} neonColor={neonColor}>
        <ButtonText main small={small}>
          {flickeringText || text}
        </ButtonText>
      </FlickeringButtonWrapper>
    );
  }

  return (
    <ButtonWrapper {...props} disabled={disabled}>
      <ButtonText small={small}>{text}</ButtonText>
    </ButtonWrapper>
  );
};

const NeonButton = React.forwardRef((props, ref) => {
  const { link, asLink, onClick, ...rest } = props;

  if (link) {
    return (
      <Link href={link} as={asLink}>
        <Clickable ref={ref}>
          <ButtonContent {...rest} />
        </Clickable>
      </Link>
    );
  }
  return (
    <Clickable onClick={onClick} ref={ref}>
      <ButtonContent {...rest} />
    </Clickable>
  );
});

const commonPropTypes = {
  text: PropTypes.string,
  main: PropTypes.bool,
  secondary: PropTypes.bool,
  tertiary: PropTypes.bool,
  disabled: PropTypes.bool,
  flickerIndex: PropTypes.number,
  small: PropTypes.bool,
  big: PropTypes.bool,
  block: PropTypes.bool,
};

ButtonContent.propTypes = {
  ...commonPropTypes,
};

NeonButton.propTypes = {
  link: PropTypes.string,
  asLink: PropTypes.string,
  onClick: PropTypes.func,
  ...commonPropTypes,
};

NeonButton.displayName = 'NeonButton';

export default NeonButton;
