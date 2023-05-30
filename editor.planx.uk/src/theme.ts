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
const TEXT_COLOR_PRIMARY = "#0B0C0C";
const TEXT_COLOR_SECONDARY = "#505A5F";
const BG_COLOR_DEFAULT = "#FFFFFF";

// Type styles
export const FONT_WEIGHT_SEMI_BOLD = "600";
export const FONT_WEIGHT_BOLD = "700";
const SPACING_TIGHT = "-0.02em";
const LINE_HEIGHT_BASE = "1.33";

const DEFAULT_PALETTE: Partial<PaletteOptions> = {
  primary: {
    main: DEFAULT_PRIMARY_COLOR,
    contrastText: BG_COLOR_DEFAULT,
  },
  background: {
    default: BG_COLOR_DEFAULT,
    paper: "#F9F8F8",
  },
  secondary: {
    main: "#B1B4B6",
  },
  text: {
    primary: TEXT_COLOR_PRIMARY,
    secondary: TEXT_COLOR_SECONDARY,
  },
  action: {
    selected: "#F8F8F8",
    focus: GOVUK_YELLOW,
  },
  error: {
    main: "#E91B0C",
  },
  success: {
    main: "#4CAF50",
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
    // Set default spacing unit to match GOV.UK
    spacing: 10,
    typography: {
      fontFamily: "'Inter', Arial, sans-serif",
      h1: {
        fontSize: "3rem",
        letterSpacing: SPACING_TIGHT,
        fontWeight: FONT_WEIGHT_BOLD,
      },
      h3: {
        fontSize: "2.25rem",
        letterSpacing: SPACING_TIGHT,
        fontWeight: FONT_WEIGHT_BOLD,
      },
      h4: {
        fontSize: "1.5rem",
        fontWeight: FONT_WEIGHT_SEMI_BOLD,
      },
      h5: {
        fontSize: "1.188rem",
        fontWeight: FONT_WEIGHT_SEMI_BOLD,
      },
      h6: {
        fontSize: "1rem",
        fontWeight: FONT_WEIGHT_SEMI_BOLD,
      },
      subtitle1: {
        fontSize: "1.5rem",
        lineHeight: LINE_HEIGHT_BASE,
        color: TEXT_COLOR_SECONDARY,
      },
      subtitle2: {
        fontSize: "1.375rem",
        lineHeight: LINE_HEIGHT_BASE,
        color: TEXT_COLOR_SECONDARY,
      },
      body1: {
        fontSize: "1.188rem",
      },
      body2: {
        fontSize: "1rem",
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
          strong: {
            fontWeight: FONT_WEIGHT_SEMI_BOLD,
          },
          b: {
            fontWeight: FONT_WEIGHT_SEMI_BOLD,
          },
          body: {
            backgroundColor: BG_COLOR_DEFAULT,
            fontSize: "1rem",
            lineHeight: LINE_HEIGHT_BASE,
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
              boxShadow: `inset 0 -4px 0 black !important`,
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
            boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.5)",
            padding: "0.5em 1.1em",
          },
          text: {
            color: "rgba(0,0,0,0.4)",
            "&:hover": {
              color: "rgba(0,0,0,1)",
            },
          },
          sizeMedium: {
            fontSize: "1rem",
            fontWeight: FONT_WEIGHT_SEMI_BOLD,
          },
          sizeLarge: {
            fontSize: "1.188rem",
            fontWeight: FONT_WEIGHT_SEMI_BOLD,
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
    components: {
      MuiRadio: {
        defaultProps: {
          disableFocusRipple: true,
          sx: {
            "& .MuiSvgIcon-root": {
              fontSize: 32,
            },
          },
        },
      },
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
