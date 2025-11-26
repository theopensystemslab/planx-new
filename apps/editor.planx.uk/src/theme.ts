import "themeOverrides.d.ts";

import { buttonClasses } from "@mui/material/Button";
import { radioClasses } from "@mui/material/Radio";
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
import { svgIconClasses } from "@mui/material/SvgIcon";
// eslint-disable-next-line no-restricted-imports
import { switchClasses } from "@mui/material/Switch";
import { tablePaginationClasses } from "@mui/material/TablePagination";
import { tooltipClasses } from "@mui/material/Tooltip";
import { deepmerge } from "@mui/utils";
import { gridClasses } from "@mui/x-data-grid";
import type {} from "@mui/x-data-grid/themeAugmentation";
import { TeamTheme } from "@opensystemslab/planx-core/types";
import { getContrastTextColor } from "styleUtils";

const DEFAULT_PRIMARY_COLOR = "#0010A4";
const DEFAULT_TONAL_OFFSET = 0.1;
export const DEFAULT_CONTRAST_THRESHOLD = 3;

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
    dark: "#2C2C2C",
    disabled: "#EEEEEE",
    data: "#F0F0F0",
  },
  secondary: {
    main: "#F3F2F1",
    dark: "#E3E3E3",
  },
  text: {
    primary: "#0B0C0C",
    secondary: "#505A5F",
    placeholder: "#68787D",
    disabled: "#68787D",
  },
  link: {
    main: DEFAULT_PRIMARY_COLOR,
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
    disabled: "#4F5C5F",
  },
  error: {
    main: "#D4351C",
  },
  success: {
    main: "#3A833C",
    dark: "#265A26",
    light: "#EFF7EE",
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
  nodeTag: {
    error: "#FFA8A1",
    blocking: "#FAE1B7",
    nonBlocking: "#FFFDB0",
    information: "#D6EFFF",
    automation: "#B7E8B0",
  },
  flowTag: {
    online: "#D6FFD7",
    offline: "#EAEAEA",
    applicationType: "#D6EFFF",
    serviceType: "#FFEABE",
  },
  template: {
    main: "#E6D6FF",
    light: "#EDE2FF",
    dark: "#C099FF",
  },
  tonalOffset: DEFAULT_TONAL_OFFSET,
  contrastThreshold: DEFAULT_CONTRAST_THRESHOLD,
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

const getThemeOptions = ({
  primaryColour,
  linkColour,
  actionColour,
}: TeamTheme): ThemeOptions => {
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
        "@media (max-width: 500px)": {
          fontSize: "2.125rem",
        },
      },
      h2: {
        fontSize: "2.25rem",
        letterSpacing: SPACING_TIGHT,
        fontWeight: FONT_WEIGHT_BOLD,
        "@media (max-width: 500px)": {
          fontSize: "1.65rem",
        },
      },
      h3: {
        fontSize: "1.5rem",
        fontWeight: FONT_WEIGHT_BOLD,
      },
      h4: {
        fontSize: "1.188rem",
        fontWeight: FONT_WEIGHT_SEMI_BOLD,
        "@media (min-width: 500px) and (max-width: 768px)": {
          fontSize: "1.15rem !important",
        },
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
      body3: {
        fontSize: "0.913rem",
      },
      data: {
        fontFamily: '"Source Code Pro", monospace',
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
        contentWide: 1500, // Larger interface wrapper
      },
    },
    transitions: {
      duration: {
        enteringScreen: 400,
      },
    },
    shape: {
      borderRadius: 2,
    },
    components: {
      MuiAccordion: {
        styleOverrides: {
          root: {
            color: palette.text.primary,
            backgroundColor: palette.background.default,
            fontSize: "1rem",
          },
        },
        defaultProps: {
          square: true,
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor: palette.background.paper,
            },
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
          {
            props: { variant: "link" },
            style: {
              color: palette.text.primary,
              boxShadow: "none",
              padding: 0,
              width: "auto",
              fontWeight: "initial",
              fontSize: "inherit",
              textDecoration: "underline",
              textUnderlineOffset: "0.1em",
              gap: "10px",
              minHeight: "48px",
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
            boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.25)",
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
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
        },
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
          {
            props: { variant: "notApplicableTag" },
            style: {
              backgroundColor: lighten(palette.warning.light, 0.7),
              fontWeight: FONT_WEIGHT_SEMI_BOLD,
              color: palette.text.primary,
            },
          },
        ],
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            zIndex: 1,
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
          fieldset: {
            minInlineSize: "unset",
            padding: 0,
            border: 0,
          },
          img: {
            // a11y: Ensure images are visible in Windows high contrast mode
            "@media (forced-colors: active)": {
              forcedColorAdjust: "none",
              backgroundColor: "white",
            },
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            margin: 1,
            backgroundColor: palette.background.default,
            borderColor: palette.border.main,
            [`& .${gridClasses.cell}`]: {
              display: "flex",
              alignItems: "flex-start",
              "&:focus": {
                ...inputFocusStyle,
                boxShadow: "none",
              },
            },
            // Set cell padding based on density setting
            [`&.${gridClasses.root}--densityCompact .${gridClasses.cell}`]: {
              padding: "5px 10px",
            },
            [`&.${gridClasses.root}--densityStandard .${gridClasses.cell}`]: {
              padding: "10px 10px",
            },
            [`&.${gridClasses.root}--densityComfortable .${gridClasses.cell}`]:
              {
                padding: "20px 10px",
              },
            [`& .${gridClasses.cell}.${gridClasses.cellCheckbox}`]: {
              paddingTop: "1px",
            },
            [`& .${gridClasses.toolbarContainer}`]: {
              borderBottom: `1px solid ${palette.border.main}`,
              background: palette.secondary.dark,
              paddingBottom: "5px",
              [`& .${buttonClasses.root}`]: {
                background: palette.background.default,
                "&:focus-visible": {
                  ...focusStyle,
                },
                // Ensure SVG icons are equal size
                "& svg": {
                  width: "18px",
                  height: "18px",
                },
              },
            },
            [`& .${gridClasses.columnHeader}.${gridClasses.withBorderColor}`]: {
              borderColor: palette.border.main,
            },
            [`& .${gridClasses.columnHeader}`]: {
              "&:focus": {
                ...inputFocusStyle,
                boxShadow: "none",
              },
              // Hide right-side border for final column header
              [`&--last .${gridClasses.columnSeparator} svg`]: {
                visibility: "hidden",
              },
            },
            [`& .${gridClasses.columnHeaderTitle}`]: {
              fontWeight: FONT_WEIGHT_SEMI_BOLD,
            },
            ".MuiDataGrid-row:hover": {
              backgroundColor: "transparent",
            },
            [`& .${gridClasses.row}.odd`]: {
              backgroundColor: lighten(palette.background.paper, 0.2),
            },
            [`& .${gridClasses.row}`]: {
              "&.Mui-selected, &.Mui-selected:hover": {
                backgroundColor: palette.info.light,
              },
            },
            [`& .${gridClasses.footerContainer}`]: {
              borderColor: palette.border.main,
            },
            [`& .${tablePaginationClasses.root}`]: {
              maxHeight: "none",
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: ({ theme }) => ({
            width: "100%",
            maxWidth: "860px",
            borderRadius: 0,
            borderTop: `10px solid ${palette.primary.main}`,
            background: theme.palette.background.paper,
            margin: theme.spacing(1),
          }),
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: ({ theme }) => ({
            padding: theme.spacing(2),
          }),
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: ({ theme }) => ({
            background: theme.palette.secondary.main,
            padding: theme.spacing(1, 2),
            gap: theme.spacing(0.5),
          }),
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: ({ theme }) => ({
            padding: theme.spacing(2),
          }),
        },
      },
      MuiDrawer: {
        defaultProps: {
          anchor: "right",
          "aria-modal": true,
          role: "dialog",
        },
        styleOverrides: {
          root: ({ theme, open }) => ({
            width: 600,
            flexShrink: 0,
            color: theme.palette.text.primary,
            transition: theme.transitions.create("margin", {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
            marginRight: open ? 0 : -600,
            [theme.breakpoints.only("xs")]: {
              width: "100%",
              marginRight: "-100%",
            },
          }),
          paper: ({ theme }) => ({
            width: "100%",
            maxWidth: 600,
            backgroundColor: theme.palette.background.paper,
            border: 0,
            boxShadow: "-4px 0 0 rgba(0,0,0,0.1)",
          }),
        },
      },
      MuiFormControlLabel: {
        styleOverrides: {
          root: {
            margin: 0,
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
      MuiInputBase: {
        styleOverrides: {
          root: {
            "&.Mui-disabled": {
              backgroundColor: palette.background.disabled,
            },
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
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: "inherit",
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
            [`& .${svgIconClasses.root}`]: {
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
              backgroundColor: "#FFF",
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
            [`&.${radioClasses.checked}.Mui-checked::after`]: {
              opacity: 1,
            },
            [`&.${radioClasses.root}.Mui-focusVisible::before`]: {
              borderWidth: "4px",
              outline: "3px solid rgba(0,0,0,0)",
              outlineOffset: "1px",
              boxShadow: `0 0 0 4px ${palette.action.focus}`,
            },
            [`&.${radioClasses.disabled}::before`]: {
              borderColor: palette.text.disabled,
            },
            [`&.${radioClasses.disabled}::after`]: {
              color: palette.text.disabled,
            },
          },
        },
        variants: [
          {
            props: { variant: "compact" },
            style: {
              "& label": { paddingBottom: "200px" },
              "&.MuiRadio-root": {
                width: "40px",
                height: "40px",
                margin: "0 0 0 0.25em",
              },
              "&.MuiRadio-root::before": {
                top: "8px",
                left: "8px",
                width: "24px",
                height: "24px",
              },
              "&.MuiRadio-root::after": {
                borderWidth: "6px",
              },
            },
          },
        ],
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            "&.Mui-disabled": {
              backgroundColor: palette.background.disabled,
            },
          },
          icon: {
            "&.Mui-disabled": {
              color: palette.grey[400],
            },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            width: "76px",
            height: "44px",
            padding: "8px",
            left: "-8px",
            marginRight: "-4px",
            [`& .${switchClasses.switchBase}`]: {
              padding: "11px",
              borderRadius: "50%",
              [`&.${switchClasses.checked}`]: {
                transform: "translateX(32px)",
              },
            },
            [`& .${switchClasses.thumb}`]: {
              background: palette.common.white,
              width: "22px",
              height: "22px",
            },
            [`& .${switchClasses.track}`]: {
              background: palette.background.dark,
              borderRadius: "20px",
              position: "relative",
              opacity: 1,
              "&::before, &::after": {
                display: "inline-block",
                position: "absolute",
                top: "50%",
                width: "50%",
                transform: "translateY(-50%)",
                color: palette.common.white,
                textAlign: "center",
                fontSize: "0.75rem",
                fontWeight: FONT_WEIGHT_SEMI_BOLD,
              },
              "&::before": {
                content: "'ON'",
                left: "4px",
                opacity: 0,
              },
              "&::after": {
                content: "'OFF'",
                right: "4px",
              },
            },
            [`& .${switchClasses.switchBase}.${switchClasses.checked}`]: {
              [`& + .${switchClasses.track}`]: {
                background: palette.success.dark,
                opacity: 1,
                "&::before": {
                  opacity: 1,
                },
                "&::after": {
                  opacity: 0,
                },
              },
            },
            [`& .${switchClasses.switchBase}.${switchClasses.disabled}`]: {
              [`& + .${switchClasses.track}`]: {
                opacity: 1,
                background: palette.text.disabled,
              },
            },
          },
        },
      },
      MuiTooltip: {
        defaultProps: {
          arrow: true,
          PopperProps: {
            modifiers: [
              {
                // Ensure tooltips are padded from viewport edge
                name: "preventOverflow",
                options: {
                  padding: 10,
                },
              },
            ],
          },
        },
        styleOverrides: {
          arrow: {
            color: palette.background.dark,
          },
          tooltip: {
            backgroundColor: palette.background.dark,
            fontSize: "0.8em",
            borderRadius: 0,
            fontWeight: FONT_WEIGHT_SEMI_BOLD,
            [`&.${tooltipClasses.tooltipPlacementRight}`]: {
              left: "-3px",
            },
            [`&.${tooltipClasses.tooltipPlacementBottom}`]: {
              top: "-3px",
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
