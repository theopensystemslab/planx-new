import { useFormik } from "formik";

export type FormikHookReturn = ReturnType<typeof useFormik>;

export interface Flow {
  id: string;
  name: string;
  slug: string;
  team: Team;
  settings?: FlowSettings;
}

export interface Team {
  name: string;
  slug: string;
  settings?: TeamSettings;
  theme?: {
    primary?: string;
    logo?: string;
  };
}

interface TeamSettings {
  design?: DesignSettings;
}

export interface FlowSettings {
  elements?: {
    privacy?: TextContent;
    help?: TextContent;
    legalDisclaimer?: TextContent;
  };
}

export interface TextContent {
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
