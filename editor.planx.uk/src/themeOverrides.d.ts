import "@mui/material/Chip";

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
