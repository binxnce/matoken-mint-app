import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button as BootstrapButton } from 'react-bootstrap';
import omit from 'lodash/omit';

import { fontSize, fontWeight } from '../utils/variables';
import { hexToRgba } from '../utils/ui';

const getFlatOverlay = (color) => `linear-gradient(0deg, ${color}, ${color})`;

const variants = {
  primary: {
    label: '#ffffff',
    background: '#8093da',
  },
  secondary: {
    label: '#000000',
    background: '#f9f6d6',
    border: '#979797',
  },
  tertiary: {
    label: '#8093da',
    background: '#ffffff',
    border: '#8093da',
  },
  positive: {
    label: '#ffffff',
    background: '#50b878',
  },
  negative: {
    label: '#ffffff',
    background: '#c77c70',
  },
  navigation: {
    label: '#ffffff',
    background: '#666666',
    fontSize: fontSize.xs,
    padding: '15px 20px',
  },
  inline: {
    label: '#909090',
    background: '#eaeaea',
    fontSize: fontSize.s,
    fontWeight: fontWeight.regular,
    padding: '8px 15px',
  },
  'tertiary-inline': {
    label: '#8093da',
    background: '#ffffff',
    border: '#8093da',
    fontSize: fontSize.s,
    fontWeight: fontWeight.regular,
    padding: '6px 15px',
  },
};

const BaseButton = styled.button`
  font-family: inherit;
  font-size: ${({ $vars }) => $vars.fontSize ?? fontSize.l};
  line-height: 1;
  font-weight: ${({ $vars }) => $vars.fontWeight ?? fontWeight.medium};

  color: ${({ $vars }) => $vars.label};
  background-color: ${({ $vars }) => $vars.background};
  padding: ${({ $vars }) => $vars.padding ?? '20px'};
  border: ${({ $vars: { border } }) => (border ? `1px solid ${hexToRgba(border, 0.8)}` : 'none')};
  border-radius: 10px;

  &:disabled {
    opacity: 0.6;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${({ $vars: { border, background } }) => hexToRgba(border ?? background, 0.5)};
  }

  &:not(:disabled) {
    &:hover {
      background-color: ${({ $vars }) => hexToRgba($vars.background, 0.8)};
      ${({ $vars: { border } }) => border && `border-color: ${hexToRgba(border, 0.5)};`}
    }

    &:active {
      background-image: ${getFlatOverlay('rgba(0, 0, 0, 0.1)')};
    }
  }
`;

const Button = React.forwardRef(({ variant = 'primary', ...rest }, ref) => (
  <BaseButton ref={ref} $vars={variants[variant]} {...rest} />
));

Button.displayName = 'Button';

Button.propTypes = {
  variant: PropTypes.oneOf([
    'primary',
    'secondary',
    'tertiary',
    'navigation',
    'positive',
    'negative',
    'inline',
    'tertiary-inline',
  ]),
};

export default Button;

const linkColors = {
  negative: '#ca3737',
  button: '#8093da',
};

export const LinkButton = styled((props) => (
  <BootstrapButton variant="link" {...omit(props, 'small', 'color')} />
)).attrs(({ color }) => ({
  color: linkColors[color],
}))`
  font-size: ${({ small }) => (small ? fontSize.xs : fontSize.l)};
  font-weight: ${fontWeight.medium};
  ${({ color }) =>
    color &&
    `
    color: ${color};
    &:not(:disabled):not(.disabled):hover {
      color: ${color};
    }
  `}
`;

LinkButton.propTypes = {
  color: PropTypes.oneOf(['negative', 'button']),
  small: PropTypes.bool,
};
