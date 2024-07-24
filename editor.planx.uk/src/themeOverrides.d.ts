import "@mui/material/Chip";
// eslint-disable-next-line no-restricted-imports
import "@mui/material/styles/createPalette";

import { RadioProps } from "@mui/material/Radio";

declare module "@mui/material/Chip" {
  interface ChipPropsVariantOverrides {
    uploadedFileTag: true;
    notApplicableTag: true;
  }
}

// Add our custom breakpoints
declare module "@mui/material/styles" {
  interface BreakpointOverrides {
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
    formWrap: true;
    contentWrap: true;
  }
}

// Append our custom colours to MUI palette
declare module "@mui/material/styles/createPalette" {
  interface Palette {
    border: { main: string; input: string; light: string };
    link: { main: string };
    prompt: { main: string; contrastText: string; light: string; dark: string };
  }

  interface PaletteOptions {
    border?: { main: string; input: string; light: string };
    link?: { main: string };
    prompt?: {
      main: string;
      contrastText: string;
      light: string;
      dark: string;
    };
  }

  interface TypeText {
    primary: string;
    secondary: string;
    disabled: string;
    placeholder: string;
  }

  interface TypeTextOptions {
    primary: string;
    secondary: string;
    disabled: string;
    placeholder: string;
  }

  interface TypeBackground {
    main: string;
    paper: string;
    dark: string;
  }

  interface TypeBackgroundOptions {
    main: string;
    paper: string;
    dark: string;
  }
}

// Append our custom variants to MUI Button
declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    help: true;
  }

  interface ButtonPropsColorOverrides {
    prompt: true;
  }
}

// Append our custom variants to MUI Radio
declare module "@mui/material/Radio" {
  interface RadioPropsVariantOverrides {
    compact: true;
  }
}
declare module "@mui/material" {
  interface RadioProps {
    variant?: keyof RadioPropsVariantOverrides;
  }
}
