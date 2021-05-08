import { red, amber } from "@material-ui/core/colors";
import { createMuiTheme, responsiveFontSizes } from "@material-ui/core/styles";

const fontFamilyRoboto = {
  fontFamily: [
    "Roboto",
    "Arial",
    "sans-serif",
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(","),
};

const fontFamilyMetropolis = {
  fontFamily: [
    "Metropolis",
    "Arial",
    "sans-serif",
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(","),
  letterSpacing: "0.015rem",
};

const themeMui = createMuiTheme({
  type: "light",
  palette: {
    primary: {
      main: "#FFF",
    },
    secondary: {
      main: amber[500],
      light: "#feefc3",
    },
    error: {
      main: red.A400,
    },
    background: {
      default: "#FFF",
      highlight: "#F1F3F4",
    },
  },
  custom: {
    fontFamily: {
      roboto: fontFamilyRoboto,
      metropolis: fontFamilyMetropolis,
    },
    palette: {
      iconColor: "#5f6368",
      btn: "#cceabb",
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1920,
    },
  },
})

export const theme = responsiveFontSizes(themeMui);
{/*export const darkTheme = responsiveFontSizes(darkMuiTheme);*/}