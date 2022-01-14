import { createMuiTheme, responsiveFontSizes } from "@material-ui/core/styles";

const GOVUK_YELLOW = "#FFDD00";

// GOVUK Focus style
// https://design-system.service.gov.uk/get-started/focus-states/
export const focusStyle = {
  outline: `3px solid ${GOVUK_YELLOW}`,
  outlineOffset: 0,
  zIndex: 1,
};

// Ensure that if the element already has a border, the border gets thicker
export const borderedFocusStyle = {
  ...focusStyle,
  boxShadow: "inset 0 0 0 2px black",
};

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
    h4: {
      fontSize: 20,
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
      main: "#000661",
      contrastText: "#fff",
    },
    background: {
      default: "#fff",
      paper: "#f2f2f2",
    },
    secondary: {
      main: "#EFEFEF",
    },
    text: {
      secondary: "rgba(0,0,0,0.6)",
    },
    action: {
      selected: "#F8F8F8",
    },
    error: {
      main: "#E91B0C",
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 500,
      md: 768, // Used with Container as general max-width
      lg: 1280,
      xl: 1920,
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
  transitions: {
    duration: {
      enteringScreen: 400,
    },
  },
  overrides: {
    MuiInputBase: {
      root: {
        "&$focused": focusStyle,
      },
    },
    MuiCssBaseline: {
      "@global": {
        body: {
          backgroundColor: "#efefef",
        },
        "*:focus": focusStyle,
      },
    },
    MuiButtonBase: {
      root: {
        fontFamily: "inherit",
        "&:focus": focusStyle,
      },
    },
    MuiListItemIcon: {
      root: {
        color: "inherit",
      },
    },
    MuiLink: {
      root: {
        // GOVUK focused text style
        // https://github.com/alphagov/govuk-frontend/blob/main/src/govuk/helpers/_focused.scss
        "&:focus": {
          outline: "3px solid transparent",
          color: "black",
          backgroundColor: GOVUK_YELLOW,
          boxShadow: `0 -2px black, 0 4px black`,
          textDecoration: "none",
        },
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

theme.props = {
  MuiButton: {
    // Removes default box shadow on buttons
    disableElevation: true,
  },
};

export default responsiveFontSizes(theme);
