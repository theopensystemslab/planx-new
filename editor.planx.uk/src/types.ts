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

interface InformationPageContent {
  heading: string;
  content: string;
}

export interface DesignSettings {
  color?: string;
  privacy?: InformationPageContent;
  help?: InformationPageContent;
}

export interface Flag {
  category: string;
  value: string;
  text: string;
  // TODO: rename text -> title, bring in a subtitle
  // subtitle?: string;
  bgColor: string;
  color: string;
}
