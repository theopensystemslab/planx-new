import "@mui/material/Chip";
import "@mui/material/Radio";
import "@mui/material/styles";
// eslint-disable-next-line no-restricted-imports
import "@mui/material/styles/createPalette";
import "@mui/material/Typography";

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
    contentWide: true;
  }
}

// Append our custom colours to MUI palette
declare module "@mui/material/styles/createPalette" {
  interface Palette {
    border: { main: string; input: string; light: string };
    link: { main: string };
    prompt: { main: string; contrastText: string; light: string; dark: string };
    nodeTag: {
      error: string;
      nonBlocking: string;
      blocking: string;
      information: string;
      automation: string;
    };
    flowTag: {
      online: string;
      offline: string;
      applicationType: string;
      serviceType: string;
    };
    template: {
      main: string;
      light: string;
      dark: string;
    };
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
    nodeTag?: {
      error: string;
      nonBlocking: string;
      blocking: string;
      information: string;
      automation: string;
    };
    flowTag?: {
      online: string;
      offline: string;
      applicationType: string;
      serviceType: string;
    };
    template?: {
      main: string;
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
    disabled: string;
    data: string;
  }

  interface TypeBackgroundOptions {
    main: string;
    paper: string;
    dark: string;
    disabled: string;
    data: string;
  }
}

// Append our custom variants to MUI Button
declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    help: true;
    link: true;
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

// Add new typography variants
declare module "@mui/material/styles" {
  interface TypographyVariants {
    body3: React.CSSProperties;
    data: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    body3?: React.CSSProperties;
    data?: React.CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    body3: true;
    data: true;
  }
}

declare module "@mui/material/Drawer" {
  interface DrawerProps {
    // a11y: Make aria-label required for all instances of Drawer
    "aria-label": string;
  }
}
