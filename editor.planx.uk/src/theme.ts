import { createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
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
    h6: {
      fontSize: 15,
      fontWeight: 600,
    },
    subtitle1: {
      fontSize: 20,
    },
    body1: {
      fontSize: 18,
    },
    body2: {
      fontSize: 15,
    },
  },
  palette: {
    primary: {
      main: "#0ECE83",
      dark: "#0D6E6B",
      contrastText: "#fff",
    },
    background: {
      default: "#fff",
      paper: "#EFEFEF",
    },
    secondary: {
      main: "#EFEFEF",
    },
    text: {
      secondary: "white",
    },
    action: {
      selected: "#F8F8F8",
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
    ...({
      MUIRichTextEditor: {
        root: {
          padding: 0,
        },
        container: {
          // Disable margins to allow a container <Box/>
          margin: 0,
          focus: {
            outline: "none",
          },
        },
        editor: {
          backgroundColor: "#fff",
          padding: "4px 10px",
          minHeight: 48,
          fontSize: 15,
        },
        placeHolder: {
          fontSize: 15,
          padding: "4px 10px",
          color: "#9a9a9a",
        },
        inlineToolbar: {
          boxShadow: "0 1px 6px 0 rgba(0, 0, 0, 0.2)",
        },
      },
      // Make TypeScript happy by 'casting away' unrecognized override keys
    } as {}),
  },
});

export default theme;
