import type { DowntimeBannerVariant } from "hooks/data/useDowntimeBanner";

export interface DowntimeBannerFormValues {
  isVisible: boolean;
  title: string;
  description: string;
}

export interface UpdateDowntimeBannerSettingsVariables {
  name: DowntimeBannerVariant;
  set: {
    is_visible: boolean;
    title: string | null;
    description: string | null;
  };
}
