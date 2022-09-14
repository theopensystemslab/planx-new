import { PaletteOptions } from "@mui/material/styles";

// TODO: This looks unused?
export const darkPalette: PaletteOptions = {
  mode: "dark",
  primary: {
    main: "#fff",
  },
  secondary: {
    main: "#fff",
  },
  contrastThreshold: 3,
  background: {
    paper: "rgba(255,255,255,0.3)",
    default: "#0010A4",
  },
};

export const lightPalette: PaletteOptions = {
  mode: "light",
  primary: {
    main: "#000",
  },
  secondary: {
    main: "#000",
  },
  contrastThreshold: 3,
  text: {
    primary: "#000",
  },
  background: {
    paper: "#efefef",
    default: "#fff",
  },
};

export const themeObject = {
  typography: {
    fontFamily: "'Inter', Arial",
    h1: {
      fontSize: 40,
      letterSpacing: "-0.02em",
      fontWeight: 700,
    },
    h3: {
      fontSize: 25,
      letterSpacing: "-0.02em",
      fontWeight: 700,
    },
    h5: {
      fontSize: 20,
      fontWeight: 700,
    },
    subtitle1: {
      fontSize: 20,
    },
    body2: {
      fontSize: 15,
    },
  },
  palette: lightPalette,
  props: {
    MuiButton: {
      color: "secondary",
    },
    MuiExpansionPanel: {
      elevation: 0,
    },
  },
  overrides: {
    MuiButton: {
      root: {
        borderRadius: 0,
        boxShadow: "none !important",
        textTransform: "none",
        fontWeight: 400,
      },
      sizeLarge: {
        minWidth: 180,
      },
    },
    MuiCssBaseline: {},
  },
};
