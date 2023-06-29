import "@mui/material/Chip";
// eslint-disable-next-line no-restricted-imports
import "@mui/material/styles/createPalette";

declare module "@mui/material/Chip" {
  interface ChipPropsVariantOverrides {
    uploadedFileTag: true;
  }
}

declare module "@mui/material/styles/createPalette" {
  interface Palette {
    dafsCustomColor: { main: string };
  }

  interface PaletteOptions {
    dafsCustomColor?: { main: string };
  }
}
