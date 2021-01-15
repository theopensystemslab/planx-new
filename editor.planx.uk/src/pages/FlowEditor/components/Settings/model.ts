export interface Settings {
  design?: DesignSettings;
}

export interface DesignSettings {
  color?: string;
  privacy?: InformationalModal;
  help?: InformationalModal;
}

export interface InformationalModal {
  header: string;
  content: string;
}
