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
