import "@mui/material/Chip";
// eslint-disable-next-line no-restricted-imports
import "@mui/material/styles/createPalette";

declare module "@mui/material/Chip" {
  interface ChipPropsVariantOverrides {
    uploadedFileTag: true;
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
