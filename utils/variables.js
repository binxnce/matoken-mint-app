import { hexToRgba } from './ui';

const MAIN_COLOR = '#9c13bb';
const TERTIARY = '#FFC44A';
const SECONDARY_COLOR = '#53B5EB';

export const colors = {
  navbar: '#FFFFFF',
  card: '#FFFFFF',
  background: '#202336',
  footer: '#FFFFFF',
  secondaryText: '#7E889D',
  text: '#4b5365',
  main: MAIN_COLOR,
  mainDark: '#663f70',
  secondary: '#53B5EB',
  error: '#FF466C',
  mainButtonDim: hexToRgba(MAIN_COLOR, 0.4),
  secondaryButtonDim: hexToRgba(SECONDARY_COLOR, 0.4),
  tertiaryButton: TERTIARY,
  tertiaryButtonDim: hexToRgba(TERTIARY, 0.4),
  warning: '#ff8d00',
  separator: '#efefef',
};

const deviceSizes = {
  mobileS: '320px',
  mobileM: '375px',
  mobileL: '575px',
  tablet: '768px',
  laptop: '992px',
  laptopL: '1440px',
  desktop: '2560px',
};

export const media = {
  min: {
    mobileS: `(min-width: ${deviceSizes.mobileS})`,
    mobileM: `(min-width: ${deviceSizes.mobileM})`,
    mobileL: `(min-width: ${deviceSizes.mobileL})`,
    tablet: `(min-width: ${deviceSizes.tablet})`,
    laptop: `(min-width: ${deviceSizes.laptop})`,
    laptopL: `(min-width: ${deviceSizes.laptopL})`,
    desktop: `(min-width: ${deviceSizes.desktop})`,
    desktopL: `(min-width: ${deviceSizes.desktop})`,
  },
  max: {
    mobileS: `(max-width: ${deviceSizes.mobileS})`,
    mobileM: `(max-width: ${deviceSizes.mobileM})`,
    mobileL: `(max-width: ${deviceSizes.mobileL})`,
    tablet: `(max-width: ${deviceSizes.tablet})`,
    laptop: `(max-width: ${deviceSizes.laptop})`,
    laptopL: `(max-width: ${deviceSizes.laptopL})`,
    desktop: `(max-width: ${deviceSizes.desktop})`,
    desktopL: `(max-width: ${deviceSizes.desktop})`,
  },
};

export const fontSize = {
  xxxl: '42px',
  xxl: '36px',
  xl: '32px',
  l: '24px',
  m: '20px',
  s: '18px',
  xs: '16px',
  xxs: '14px',
};

export const fontWeight = {
  regular: 400,
  medium: 500,
  bold: 700,
};
