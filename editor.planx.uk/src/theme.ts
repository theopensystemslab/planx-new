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
import { TeamTheme } from "@opensystemslab/planx-core/types";
import { getContrastTextColor } from "styleUtils";

const DEFAULT_PRIMARY_COLOR = "#0010A4";
const DEFAULT_TONAL_OFFSET = 0.1;

// Type styles
export const FONT_WEIGHT_SEMI_BOLD = "600";
export const FONT_WEIGHT_BOLD = "700";
export const LINE_HEIGHT_BASE = "1.33";
const SPACING_TIGHT = "-0.02em";

const DEFAULT_PALETTE: Partial<PaletteOptions> = {
  primary: {
    main: DEFAULT_PRIMARY_COLOR,
    contrastText: "#FFFFFF",
  },
  background: {
    default: "#FFFFFF",
    paper: "#F9F8F8",
  },
  secondary: {
    main: "#F3F2F1",
  },
  text: {
    primary: "#0B0C0C",
    secondary: "#505A5F",
  },
  link: {
    main: DEFAULT_PRIMARY_COLOR
  },
  prompt: {
    main: DEFAULT_PRIMARY_COLOR,
    contrastText: "#FFFFFF",
    light: lighten(DEFAULT_PRIMARY_COLOR, DEFAULT_TONAL_OFFSET),
    dark: darken(DEFAULT_PRIMARY_COLOR, DEFAULT_TONAL_OFFSET),
  },
  action: {
    selected: "#F8F8F8",
    focus: "#FFDD00",
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
    input: "#0B0C0C",
    light: "#E0E0E0",
  },
  tonalOffset: DEFAULT_TONAL_OFFSET,
};

// GOVUK Focus style
// https://design-system.service.gov.uk/get-started/focus-states/
// https://github.com/alphagov/govuk-frontend/blob/main/src/govuk/helpers/_focused.scss
export const focusStyle = {
  color: DEFAULT_PALETTE.text?.primary,
  backgroundColor: DEFAULT_PALETTE.action?.focus,
  boxShadow: `0 -2px ${DEFAULT_PALETTE.action?.focus}, 0 4px ${DEFAULT_PALETTE.text?.primary}`,
  textDecoration: "none",
  outline: "3px solid transparent",
};

// Default focus style for input
export const inputFocusStyle = {
  outline: `3px solid ${DEFAULT_PALETTE.action?.focus}`,
  outlineOffset: -1,
  zIndex: 1,
  boxShadow: `inset 0 0 0 2px ${DEFAULT_PALETTE.text?.primary}`,
};

// Ensure that if the element already has a border, the border gets thicker
export const borderedFocusStyle = {
  ...inputFocusStyle,
  outlineOffset: 0,
  background: "transparent",
};

export const linkStyle = (linkColour: string) => ({
  color: linkColour || "inherit",
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

const getThemeOptions = ({ primaryColour, linkColour, actionColour}: TeamTheme): ThemeOptions => {
  const teamPalette: Partial<PaletteOptions> = {
    primary: {
      main: primaryColour,
    },
    link: {
      main: linkColour,
    },
    prompt: {
      main: actionColour,
      light: lighten(actionColour, DEFAULT_TONAL_OFFSET),
      dark: darken(actionColour, DEFAULT_TONAL_OFFSET),
      contrastText: getContrastTextColor(actionColour, "#FFF")!,
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
        color: palette.text.secondary,
      },
      subtitle2: {
        fontSize: "1.188rem",
        lineHeight: LINE_HEIGHT_BASE,
        color: palette.text.secondary,
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
            backgroundColor: palette.background.default,
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
              boxShadow: `inset 0 -4px 0 ${DEFAULT_PALETTE.text?.primary} !important`,
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
        variants: [
          {
            props: { variant: "help" },
            style: {
              color: palette.link.main,
              boxShadow: "none",
              padding: "0.25em 0.1em",
              width: "auto",
              fontWeight: "initial",
              fontSize: "inherit",
              textDecoration: "underline",
              textDecorationThickness: "2px",
              textDecorationStyle: "dotted",
              textUnderlineOffset: "4px",
              "&:hover": {
                textDecoration: "underline",
                textDecorationThickness: "3px",
                background: "transparent",
                boxShadow: "none",
              },
              "&:focus": {
                borderColor: palette.text.primary,
                borderStyle: "solid",
              },
            },
          },
        ],
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
            "&:hover": {
              boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.5)",
            },
          },
          text: {
            color: palette.text.secondary,
            "&:hover": {
              color: palette.text.primary,
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
            borderColor: palette.primary.main,
            color: palette.text.primary,
            backgroundColor: palette.common.white,
            "&:hover": {
              borderWidth: "2px 2px 3px",
              backgroundColor: palette.primary.dark,
              color: palette.common.white,
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
                color: palette.common.black,
                borderColor: palette.common.black,
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
            ...linkStyle(palette.link.main),
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
            color: palette.text.primary,
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
              color: palette.text.primary,
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
              color: palette.text.primary,
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
              boxShadow: `0 0 0 4px ${palette.action.focus}`,
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
  teamTheme: TeamTheme = {
    primaryColour: DEFAULT_PRIMARY_COLOR,
    actionColour: DEFAULT_PRIMARY_COLOR,
    linkColour: DEFAULT_PRIMARY_COLOR,
    logo: null,
    favicon: null,
  },
): MUITheme => {
  const themeOptions = getThemeOptions(teamTheme);
  const theme = responsiveFontSizes(createTheme(themeOptions), { factor: 3 });
  return theme;
};

// A static MUI theme based on PlanX's default palette
const defaultTheme = generateTeamTheme();

export { defaultTheme, generateTeamTheme };
