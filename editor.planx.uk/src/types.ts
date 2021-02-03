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

export interface Settings {
  design?: DesignSettings;
}

export interface DesignSettings {
  color?: string;
  privacy?: InformationPageContent;
  help?: InformationPageContent;
}

export interface InformationPageContent {
  heading: string;
  content: string;
}
