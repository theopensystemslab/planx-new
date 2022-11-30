import {
  createTheme,
  responsiveFontSizes,
  ThemeOptions,
} from "@mui/material/styles";

import { TeamTheme } from "./types";

const GOVUK_YELLOW = "#FFDD00";

// GOVUK Focus style
// https://design-system.service.gov.uk/get-started/focus-states/
// https://github.com/alphagov/govuk-frontend/blob/main/src/govuk/helpers/_focused.scss
export const focusStyle = {
  color: "black",
  backgroundColor: GOVUK_YELLOW,
  boxShadow: `0 -2px ${GOVUK_YELLOW}, 0 4px black`,
  textDecoration: "none",
  outline: "3px solid transparent",
};

// Ensure that if the element already has a border, the border gets thicker
export const borderedFocusStyle = {
  outline: `3px solid ${GOVUK_YELLOW}`,
  outlineOffset: 0,
  zIndex: 1,
  boxShadow: "inset 0 0 0 2px black",
  backgroundColor: "transparent",
};

export const linkStyle = (primaryColor?: string) => ({
  color: primaryColor || "inherit",
  textDecoration: "underline",
  textDecorationThickness: "1px",
  textUnderlineOffset: "0.1em",
  "&:hover": {
    textDecorationThickness: "3px",
    // Disable ink skipping on underlines on hover. Browsers haven't
    // standardised on this part of the spec yet, so set both properties
    textDecorationSkipInk: "none", // Chromium, Firefox
    textDecorationSkip: "none", // Safari
  },
  "&:focus-visible": focusStyle,
});

/**
 * Get Global theme options
 * The global theme is used in editor, and as the base theme in Preview/Unpublished which can be
 * merged with Team specific options
 */
export const getGlobalThemeOptions = (): ThemeOptions => {
  const themeOptions: ThemeOptions = {
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
        focus: GOVUK_YELLOW,
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
    transitions: {
      duration: {
        enteringScreen: 400,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: "#efefef",
            fontSize: "0.875rem",
            lineHeight: 1.43,
            letterSpacing: "0.01071em",
          },
        },
      },
      MuiButtonBase: {
        styleOverrides: {
          root: {
            fontFamily: "inherit",
            "&:focus-visible": {
              ...focusStyle,
              // !important is required here as setting disableElevation = true removes boxShadow
              boxShadow: `0 -2px ${GOVUK_YELLOW}, 0 4px black !important`,
              // Hover should not overwrite focus
              "&:hover": focusStyle,
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: "inherit",
          },
        },
      },
      MuiButton: {
        defaultProps: {
          // Removes default box shadow on buttons
          disableElevation: true,
          disableFocusRipple: true,
        },
        styleOverrides: {
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
      },
      MuiIconButton: {
        defaultProps: {
          disableFocusRipple: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 0,
            "&:focus-visible": {
              "& svg, div": {
                color: "black",
                borderColor: "black",
              },
              "&>*:hover": {
                backgroundColor: "transparent",
              },
            },
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
      },
    },
  };

  return themeOptions;
};

/**
 * Get team specific theme options
 * Pass in TeamTheme to customise the palette and associated overrides
 * Rules here will only apply in the Preview and Unpublished routes
 */
export const getTeamThemeOptions = (
  theme: TeamTheme | undefined
): ThemeOptions => {
  const primary = theme?.primary || "#2c2c2c";
  return {
    palette: {
      primary: {
        main: primary,
      },
    },
    components: {
      MuiLink: {
        styleOverrides: {
          root: {
            ...linkStyle(theme?.primary),
          },
        },
      },
    },
  };
};

const globalTheme = createTheme(getGlobalThemeOptions());

export default responsiveFontSizes(globalTheme);
