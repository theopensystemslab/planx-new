export interface Settings {
  design?: DesignSettings;
}

export interface DesignSettings {
  color?: string;
  privacy?: FooterModal;
  help?: FooterModal;
}

interface FooterModal {
  header: string;
  content: string;
}
