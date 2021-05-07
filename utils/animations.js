import { keyframes } from 'styled-components';
import { colors } from './variables';
import { hexToRgba } from './ui';

const glitch = keyframes`
  0% {
      -webkit-transform: translate(0);
      transform: translate(0)
  }
  20% {
      -webkit-transform: translate(-5px, 5px);
      transform: translate(-5px, 5px)
  }
  40% {
      -webkit-transform: translate(-5px, -5px);
      transform: translate(-5px, -5px)
  }
  60% {
      -webkit-transform: translate(5px, 5px);
      transform: translate(5px, 5px)
  }
  80% {
      -webkit-transform: translate(5px, -5px);
      transform: translate(5px, -5px)
  }
  to {
      -webkit-transform: translate(0);
      transform: translate(0)
  }
`;

const flicker = keyframes`
  0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% { opacity: .99; }
  20%, 21.999%, 63%, 63.999%, 65%, 69.999% { opacity: 0.4; }
`;

const textFlickering = keyframes`
  2% {
    color: ${colors.main};
    text-shadow: 0 0 15px ${colors.main};
  }
    3% {
      color: rgba(120, 0, 50, .5);
      text-shadow: none;
  }
    6% {
      color: ${colors.main};
      text-shadow: 0 0 15px ${colors.main};
  }
    9% {
      color: rgba(120, 0, 50, .5);
      text-shadow: none;
  }
    11% {
      color: ${colors.main};
      text-shadow: 0 0 15px ${colors.main};
  }
    14% {
      color: rgba(120, 0, 50, .5);
      text-shadow: none;
  }
    18% {
      color: ${colors.main};
      text-shadow: 0 0 15px ${colors.main};
  }
    32% {
      color: ${colors.main};
      text-shadow: 0 0 15px ${colors.main};
  }
    33% {
      color: rgba(120, 0, 50, .5);
      text-shadow: none;
  }
    37% {
      color: ${colors.main};
      text-shadow: 0 0 15px ${colors.main};
  }
    39% {
      color: rgba(120, 0, 50, .5);
      text-shadow: none;
  }
    43% {
      color: ${colors.main};
      text-shadow: 0 0 15px ${colors.main};
  }
    46% {
      color: rgba(120, 0, 50, .5);
      text-shadow: none;
  }
    47% {
      color: ${colors.main};
      text-shadow: 0 0 15px ${colors.main};
  }
    100% {
      color: ${colors.main};
      text-shadow: 0 0 15px ${colors.main};
  }
`;

const letterFlickering = keyframes`
  2% {
      color: ${colors.main};
      text-shadow: 0 0 15px ${colors.main};
  }
    3% {
      color: rgba(120, 0, 50, .5);
      text-shadow: none;
  }
    6% {
      color: ${colors.main};
      text-shadow: 0 0 15px ${colors.main};
  }
    9% {
      color: rgba(120, 0, 50, .5);
      text-shadow: none;
  }
    11% {
      color: ${colors.main};
      text-shadow: 0 0 15px ${colors.main};
  }
    14% {
      color: rgba(120, 0, 50, .5);
      text-shadow: none;
  }
    18% {
      color: ${colors.main};
      text-shadow: 0 0 15px ${colors.main};
  }
    32% {
      color: ${colors.main};
      text-shadow: 0 0 15px ${colors.main};
  }
    33% {
      color: rgba(120, 0, 50, .5);
      text-shadow: none;
  }
    37% {
      color: ${colors.main};
      text-shadow: 0 0 15px ${colors.main};
  }
    39% {
      color: rgba(120, 0, 50, .5);
      text-shadow: none;
  }
    40% {
      color: ${colors.main};
      text-shadow: 0 0 15px ${colors.main};
  }
    100% {
      color: ${colors.main};
      text-shadow: 0 0 15px ${colors.main};
  }
`;

const outlineFlickering = keyframes`
  2% {
      border: 2px solid ${colors.secondary};
    box-shadow: 0 0 15px -1px ${colors.secondary},
      0 0 12px -1px ${colors.secondary} inset;
  }
    3% {
      border: 2px solid ${colors.secondaryText};
    box-shadow: none;
  }
    5% {
      border: 2px solid ${colors.secondary};
    box-shadow: 0 0 15px -1px ${colors.secondary},
      0 0 12px -1px ${colors.secondary} inset;
  }
    6% {
      border: 2px solid ${colors.secondaryText};
    box-shadow: none;
  }
    7% {
      border: 2px solid ${colors.secondary};
    box-shadow: 0 0 15px -1px ${colors.secondary},
      0 0 12px -1px ${colors.secondary} inset;
  }
    9% {
      border: 2px solid ${colors.secondaryText};
    box-shadow: none;
  }
    13% {
      border: 2px solid ${colors.secondary};
    box-shadow: 0 0 15px -1px ${colors.secondary},
      0 0 12px -1px ${colors.secondary} inset;
  }
    16% {
      border: 2px solid ${colors.secondaryText};
    box-shadow: none;
  }
    18% {
      border: 2px solid ${colors.secondary};
    box-shadow: 0 0 15px -1px ${colors.secondary},
      0 0 12px -1px ${colors.secondary} inset;
  }
    22% {
      border: 2px solid ${colors.secondaryText};
    box-shadow: none;
  }
    34% {
      border: 2px solid ${colors.secondary};
    box-shadow: 0 0 15px -1px ${colors.secondary},
      0 0 12px -1px ${colors.secondary} inset;
  }
    36% {
      border: 2px solid ${colors.secondaryText};
    box-shadow: none;
  }
    54% {
      border: 2px solid ${colors.secondary};
    box-shadow: 0 0 15px -1px ${colors.secondary},
      0 0 12px -1px ${colors.secondary} inset;
  }
    100% {
      border: 2px solid ${colors.secondary};
    box-shadow: 0 0 15px -1px ${colors.secondary},
      0 0 12px -1px ${colors.secondary} inset;
  }
`;

const externalGlow = '0 0 10px -1px';
const internalGlow = '0 0 11px -1px';

const externalGlowDim = '0 0 8px -1px';
const internalGlowDim = '0 0 9px -1px';

const blinkAndLightOn = (color = colors.secondary) => keyframes`
  6% {
    border: 2px solid ${hexToRgba(color, 0.4)};
    box-shadow: ${externalGlowDim} ${hexToRgba(color, 0.4)}, ${internalGlowDim} ${hexToRgba(color, 0.4)} inset;
  }
  8% {
    border: 2px solid ${hexToRgba(color, 0.7)};
    box-shadow: ${externalGlowDim} ${hexToRgba(color, 0.7)}, ${internalGlowDim} ${hexToRgba(color, 0.7)} inset;
  }
  10% {
    border: 2px solid ${color};
    box-shadow: ${externalGlow} ${color}, ${internalGlow} ${color} inset;
  }
  12% {
    border: 2px solid ${hexToRgba(color, 0.7)};
    box-shadow: ${externalGlowDim} ${hexToRgba(color, 0.7)}, ${internalGlowDim} ${hexToRgba(color, 0.7)} inset;
  }
  30% {
    border: 2px solid ${color};
    box-shadow: ${externalGlow} ${color}, ${internalGlow} ${color} inset;
  }
  50% {
    border: 2px solid ${hexToRgba(color, 0.9)} ;
    box-shadow: ${externalGlow} ${hexToRgba(color, 0.7)}, ${internalGlow} ${hexToRgba(color, 0.7)} inset;
  }
  55% {
    border: 2px solid ${color} ;
    box-shadow: ${externalGlow} ${color}, ${internalGlow} ${color} inset;
  }
  60% {
    border: 2px solid ${color} ;
    box-shadow: ${externalGlow} ${color}, ${internalGlow} ${color} inset;
  }
  62% {
    border: 2px solid ${hexToRgba(color, 0.9)};
    box-shadow: ${externalGlowDim} ${hexToRgba(color, 0.9)}, ${internalGlowDim} ${hexToRgba(color, 0.9)} inset;
  }
  80% {
    border: 2px solid ${hexToRgba(color, 0.9)};
    box-shadow: ${externalGlowDim} ${hexToRgba(color, 0.9)}, ${internalGlowDim} ${hexToRgba(color, 0.9)} inset;
  }
  100% {
    border: 2px solid ${color};
    box-shadow: ${externalGlow} ${color}, ${internalGlow} ${color} inset;
  }
`;

const lightDimming = (color = colors.secondary) => keyframes`
  0% {
    border: 2px solid ${hexToRgba(color, 0.6)};
    box-shadow: ${externalGlowDim} ${hexToRgba(color, 0.6)}, ${internalGlowDim} ${hexToRgba(color, 0.6)} inset;
  }
  10% {
    border: 2px solid ${color};
    box-shadow: ${externalGlow} ${color}, ${internalGlow} ${color} inset;
  }
  30% {
    border: 2px solid ${hexToRgba(color, 0.7)};
    box-shadow: ${externalGlowDim} ${hexToRgba(color, 0.7)}, ${internalGlowDim} ${hexToRgba(color, 0.7)} inset;
  }
  40% {
    border: 2px solid ${color};
    box-shadow: ${externalGlow} ${color}, ${internalGlow} ${color} inset;
  }
  65% {
    border: 2px solid ${hexToRgba(color, 0.9)} ;
    box-shadow: ${externalGlow} ${hexToRgba(color, 0.7)}, ${internalGlow} ${hexToRgba(color, 0.7)} inset;
  }
  80% {
    border: 2px solid ${hexToRgba(color, 0.9)};
    box-shadow: ${externalGlowDim} ${hexToRgba(color, 0.9)}, ${internalGlowDim} ${hexToRgba(color, 0.9)} inset;
  }
  90% {
    border: 2px solid ${color};
    box-shadow: ${externalGlow} ${color}, ${internalGlow} ${color} inset;
  }
  100% {
    border: 2px solid ${hexToRgba(color, 0.6)};
    box-shadow: ${externalGlowDim} ${hexToRgba(color, 0.6)}, ${internalGlowDim} ${hexToRgba(color, 0.6)} inset;
  }
`;

const lightDimmingLine = (color = colors.secondary) => keyframes`
  0% {
    border-bottom-style: solid;
    border-bottom-width: 3px;
    border-bottom-color: ${hexToRgba(color, 0.2)};
    filter: blur(1px);
  }
  10% {
    border-bottom-style: solid;
    border-bottom-width: 3px;
    border-bottom-color: ${color};
    filter: blur(2px);
  }
  30% {
    border-bottom-style: solid;
    border-bottom-width: 3px;
    border-bottom-color: ${hexToRgba(color, 0.5)};
    filter: blur(1px);
  }
  40% {
    border-bottom-style: solid;
    border-bottom-width: 3px;
    border-bottom-color: ${color};
    filter: blur(2px);
  }
  65% {
    border-bottom-style: solid;
    border-bottom-width: 3px;
    border-bottom-color: ${hexToRgba(color, 0.9)} ;
    filter: blur(1px);
  }
  80% {
    border-bottom-style: solid;
    border-bottom-width: 3px;
    border-bottom-cpx);
  }
  90% {
    border-bottom-style: solid;
    border-bottom-width: 3px;
    border-bottom-color: ${color};
    filter: blur(2px);
  }
  100% {
    border-bottom-style: solid;
    border-bottom-width: 3px;
    border-bottom-color: ${hexToRgba(color, 0.2)};
    filter: blur(1px);
  }
`;

export const animations = {
  glitch,
  flicker,
  textFlickering,
  letterFlickering,
  outlineFlickering,
  blinkAndLightOn,
  lightDimming,
  lightDimmingLine,
};
