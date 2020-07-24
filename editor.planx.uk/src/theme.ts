import { createMuiStrictModeTheme } from "./react-experimental";

const theme = createMuiStrictModeTheme({
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
  palette: {
    primary: {
      main: "#0ECE83",
      contrastText: "#fff",
    },
    text: {
      secondary: "rgba(0,0,0,0.4)",
    },
  },
  props: {
    // MuiButton: {
    //   elevation: 0,
    // },
    MuiPaper: {
      elevation: 0,
    },
  },
  overrides: {
    MuiCssBaseline: {
      "@global": {
        body: {
          backgroundColor: "#efefef",
        },
      },
    },
    MuiButtonBase: {
      root: {
        fontFamily: "inherit",
      },
    },
    MuiListItemIcon: {
      root: {
        color: "inherit",
      },
    },
    MuiButton: {
      root: {
        borderRadius: 0,
        textTransform: "none",
      },
      text: {
        color: "rgba(0,0,0,0.4)",
        "&:hover": {
          color: "rgba(0,0,0,1)",
        },
      },
      containedSizeLarge: {
        fontWeight: 700,
      },
    },
    MuiIconButton: {
      root: {
        borderRadius: 0,
      },
    },
  },
});

export default theme;
