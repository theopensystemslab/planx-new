import { useFormik } from "formik";

export type FormikHookReturn = ReturnType<typeof useFormik>;

export interface Flow {
  id: string;
  name: string;
  slug: string;
  team: Team;
}

export interface Team {
  name: string;
  slug: string;
  settings?: Settings;
  theme?: {
    primary?: string;
    logo?: string;
  };
}

// TODO: Break these up into Team settings & Flow settings
export interface Settings {
  design?: DesignSettings;
}

interface TextContent {
  heading: string;
  content: string;
  show: boolean;
}

export interface DesignSettings {
  color?: string;
  privacy?: TextContent;
  help?: TextContent;
  legalDisclaimer?: TextContent;
}
