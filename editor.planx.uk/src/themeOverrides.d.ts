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
  }

  interface PaletteOptions {
    border?: { main: string; input: string; light: string };
  }
}
