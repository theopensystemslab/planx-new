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
export const focusStyle = (focusColour: string = GOVUK_YELLOW) => ({
  color: "black",
  backgroundColor: focusColour,
  boxShadow: `0 -2px ${focusColour}, 0 4px black`,
  textDecoration: "none",
  outline: "3px solid transparent",
});

// Ensure that if the element already has a border, the border gets thicker
export const borderedFocusStyle = (focusColour: string = GOVUK_YELLOW) => ({
  outline: `3px solid ${focusColour}`,
  outlineOffset: 0,
  zIndex: 1,
  boxShadow: "inset 0 0 0 2px black",
});

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
  };

  // Separately setting "components" allows us to refer back to the palette
  // TODO: This workaround was required for MUI v4, but there might be a better way of achieving this now
  themeOptions.components = {
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
            ...focusStyle(themeOptions.palette?.action?.focus),
            // !important is required here as setting disableElevation = true removes boxShadow
            boxShadow: `0 -2px ${themeOptions.palette?.action?.focus}, 0 4px black !important`,
            // Hover should not overwrite focus
            "&:hover": focusStyle(themeOptions.palette?.action?.focus),
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
    MuiLink: {
      styleOverrides: {
        root: {
          "&:focus-visible": focusStyle(themeOptions.palette?.action?.focus),
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
            ...focusStyle(themeOptions.palette?.action?.focus),
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
  const focus = theme?.focus || GOVUK_YELLOW;
  return {
    palette: {
      primary: {
        main: primary,
      },
      action: {
        focus: focus,
      },
    },
    components: {
      MuiButtonBase: {
        styleOverrides: {
          root: {
            "&:focus-visible": {
              ...focusStyle(focus),
              // !important is required here as setting disableElevation = true removes boxShadow
              boxShadow: `0 -2px ${focus}, 0 4px black !important`,
              "&:hover": focusStyle(focus),
            },
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            ...linkStyle(theme?.primary),
            "&:focus-visible": {
              backgroundColor: focus,
              boxShadow: `0 -2px ${focus}, 0 4px black`,
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            "&:focus-visible": focusStyle(focus),
          },
        },
      },
    },
  };
};

const globalTheme = createTheme(getGlobalThemeOptions());

export default responsiveFontSizes(globalTheme);
