import "themeOverrides.d.ts";

import {
  createTheme,
  darken,
  lighten,
  responsiveFontSizes,
  Theme as MUITheme,
  ThemeOptions,
} from "@mui/material/styles";
// eslint-disable-next-line no-restricted-imports
import createPalette, {
  PaletteOptions,
} from "@mui/material/styles/createPalette";
import { deepmerge } from "@mui/utils";

export const GOVUK_YELLOW = "#FFDD00";

export const DEFAULT_PRIMARY_COLOR = "#0010A4";
const TEXT_COLOR_PRIMARY = "#0B0C0C";
const TEXT_COLOR_SECONDARY = "#505A5F";
const BG_COLOR_DEFAULT = "#FFFFFF";

// Type styles
export const FONT_WEIGHT_SEMI_BOLD = "600";
export const FONT_WEIGHT_BOLD = "700";
export const LINE_HEIGHT_BASE = "1.33";
const SPACING_TIGHT = "-0.02em";

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
    main: "#F3F2F1",
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
    main: "#D4351C",
  },
  success: {
    main: "#4CAF50",
  },
  info: {
    main: "#2196F3",
    light: "#EBF4FD",
  },
  border: {
    main: "#B1B4B6",
    input: TEXT_COLOR_PRIMARY,
    light: "#E0E0E0",
  },
};

// GOVUK Focus style
// https://design-system.service.gov.uk/get-started/focus-states/
// https://github.com/alphagov/govuk-frontend/blob/main/src/govuk/helpers/_focused.scss
export const focusStyle = {
  color: TEXT_COLOR_PRIMARY,
  backgroundColor: GOVUK_YELLOW,
  boxShadow: `0 -2px ${GOVUK_YELLOW}, 0 4px ${TEXT_COLOR_PRIMARY}`,
  textDecoration: "none",
  outline: "3px solid transparent",
};

// Ensure that if the element already has a border, the border gets thicker
export const borderedFocusStyle = {
  outline: `3px solid ${GOVUK_YELLOW}`,
  outlineOffset: 0,
  zIndex: 1,
  boxShadow: `inset 0 0 0 2px ${TEXT_COLOR_PRIMARY}`,
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
      h2: {
        fontSize: "2.25rem",
        letterSpacing: SPACING_TIGHT,
        fontWeight: FONT_WEIGHT_BOLD,
      },
      h3: {
        fontSize: "1.5rem",
        fontWeight: FONT_WEIGHT_BOLD,
      },
      h4: {
        fontSize: "1.188rem",
        fontWeight: FONT_WEIGHT_SEMI_BOLD,
      },
      h5: {
        fontSize: "1rem",
        fontWeight: FONT_WEIGHT_SEMI_BOLD,
      },
      h6: {
        fontSize: "1rem",
        fontWeight: FONT_WEIGHT_SEMI_BOLD,
      },
      subtitle1: {
        fontSize: "1.375rem",
        lineHeight: LINE_HEIGHT_BASE,
        color: TEXT_COLOR_SECONDARY,
      },
      subtitle2: {
        fontSize: "1.188rem",
        lineHeight: LINE_HEIGHT_BASE,
        color: TEXT_COLOR_SECONDARY,
      },
      body1: {
        fontSize: "1.188rem",
        lineHeight: LINE_HEIGHT_BASE,
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
        md: 768,
        lg: 1280,
        xl: 1920,
        formWrap: 690, // Max width for form content
        contentWrap: 1020, // Max width for page
      },
    },
    transitions: {
      duration: {
        enteringScreen: 400,
      },
    },
    components: {
      MuiContainer: {
        styleOverrides: {
          root: {
            "@media (min-width: 500px)": {
              padding: "0 20px",
            },
            "@media (min-width: 768px)": {
              padding: "0 30px",
            },
          },
        },
      },
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
            lineHeight: LINE_HEIGHT_BASE,
          },
          hr: {
            marginLeft: 0,
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
              boxShadow: `inset 0 -4px 0 ${TEXT_COLOR_PRIMARY} !important`,
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
            padding: "0.7em 1.25em",
            lineHeight: LINE_HEIGHT_BASE,
            minWidth: "3em",
          },
          text: {
            color: TEXT_COLOR_SECONDARY,
            "&:hover": {
              color: TEXT_COLOR_PRIMARY,
            },
          },
          sizeSmall: {
            fontSize: "0.875em",
            fontWeight: FONT_WEIGHT_SEMI_BOLD,
          },
          sizeMedium: {
            fontSize: "1rem",
            fontWeight: FONT_WEIGHT_SEMI_BOLD,
          },
          sizeLarge: {
            fontSize: "1.05em",
            fontWeight: FONT_WEIGHT_SEMI_BOLD,
            width: "100%",
            "@media (min-width: 768px)": {
              width: "auto",
            },
          },
          outlined: {
            borderWidth: "2px 2px 3px",
            borderColor: "currentcolor",
            "&:hover": {
              borderWidth: "2px 2px 3px",
            },
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
        styleOverrides: {
          root: {
            borderRadius: 0,
          },
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
      MuiListItem: {
        styleOverrides: {
          root: {
            lineHeight: LINE_HEIGHT_BASE,
          },
        },
      },
      MuiChip: {
        variants: [
          {
            props: { variant: "uploadedFileTag", size: "small" },
            style: {
              backgroundColor: lighten(palette.success.main, 0.8),
              fontWeight: FONT_WEIGHT_SEMI_BOLD,
              color: darken(palette.info.main, 0.8),
            },
          },
        ],
      },
      MuiRadio: {
        defaultProps: {
          disableRipple: true,
          disableFocusRipple: true,
          sx: {
            position: "relative",
            flexShrink: 0,
            width: "44px",
            height: "44px",
            padding: 0,
            margin: "0 0.75em 0 0",
            color: TEXT_COLOR_PRIMARY,
            "& .MuiSvgIcon-root": {
              // Hide default MUI SVG, we'll use pseudo elements as Gov.uk
              visibility: "hidden",
            },
            "&::before": {
              // Styles for radio icon border
              content: "''",
              position: "absolute",
              top: "2px",
              left: "2px",
              width: "40px",
              height: "40px",
              color: TEXT_COLOR_PRIMARY,
              border: "2px solid currentcolor",
              borderRadius: "50%",
              background: "rgba(0,0,0,0)",
            },
            "&::after": {
              // Styles for radio icon dot
              content: "''",
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 0,
              height: 0,
              transform: "translate(-50%, -50%)",
              color: TEXT_COLOR_PRIMARY,
              border: "10px solid currentcolor",
              borderRadius: "50%",
              background: "currentcolor",
              // Hide by default, show if checked
              opacity: 0,
            },
            "&.Mui-checked::after": {
              opacity: 1,
            },
            "&.Mui-focusVisible::before": {
              borderWidth: "4px",
              outline: "3px solid rgba(0,0,0,0)",
              outlineOffset: "1px",
              boxShadow: `0 0 0 4px ${GOVUK_YELLOW}`,
            },
          },
        },
      },
    },
  };

  return themeOptions;
};

// Generate a MUI theme based on a team's primary color
const generateTeamTheme = (
  primaryColor: string = DEFAULT_PRIMARY_COLOR,
): MUITheme => {
  const themeOptions = getThemeOptions(primaryColor);
  const theme = responsiveFontSizes(createTheme(themeOptions), { factor: 3 });
  return theme;
};

// A static MUI theme based on PlanX's default palette
const defaultTheme = generateTeamTheme(DEFAULT_PRIMARY_COLOR);

export { defaultTheme, generateTeamTheme };
