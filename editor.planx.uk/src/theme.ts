import {
  createTheme,
  responsiveFontSizes,
  Theme,
  ThemeOptions,
} from "@mui/material/styles";
// eslint-disable-next-line no-restricted-imports
import createPalette, {
  PaletteOptions,
} from "@mui/material/styles/createPalette";
import { deepmerge } from "@mui/utils";
import { hasFeatureFlag } from "lib/featureFlags";

const GOVUK_YELLOW = "#FFDD00";

const DEFAULT_PRIMARY_COLOR = "#000661";

const DEFAULT_PALETTE: Partial<PaletteOptions> = {
  primary: {
    main: DEFAULT_PRIMARY_COLOR,
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
  success: {
    main: "#00703C",
  },
};

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

const getThemeOptions = (primaryColor: string): ThemeOptions => {
  const teamPalette: Partial<PaletteOptions> = {
    primary: {
      main: primaryColor,
    },
  };
  const palette = createPalette(deepmerge(DEFAULT_PALETTE, teamPalette));

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
    palette,
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
      MuiLink: {
        styleOverrides: {
          root: {
            ...linkStyle(palette.primary.main),
            "&:disabled": {
              color: palette.text.disabled,
              cursor: "default",
              textDecoration: "none",
            },
          },
        },
      },
    },
  };

  return themeOptions;
};

const getAltThemeOptions = (primaryColor: string): ThemeOptions => {
  const themeOptions = getThemeOptions(primaryColor);
  const altThemeOptions: ThemeOptions = {
    typography: {
      fontFamily: "Arial",
    },
  };
  return deepmerge(themeOptions, altThemeOptions);
};

// Generate a MUI theme based on a team's primary color
const generateTeamTheme = (
  primaryColor: string = DEFAULT_PRIMARY_COLOR
): Theme => {
  const themeOptions = hasFeatureFlag("ALT_THEME")
    ? getAltThemeOptions(primaryColor)
    : getThemeOptions(primaryColor);
  const theme = responsiveFontSizes(createTheme(themeOptions));
  return theme;
};

// A static MUI theme based on PlanX's default palette
const defaultTheme = generateTeamTheme(DEFAULT_PRIMARY_COLOR);

export { defaultTheme, generateTeamTheme };
