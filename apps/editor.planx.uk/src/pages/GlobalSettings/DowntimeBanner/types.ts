import type {
  DowntimeBannerData,
  DowntimeBannerVariant,
} from "hooks/data/useDowntimeBanner";

export interface DowntimeBannerFormValues {
  isVisible: boolean;
  title: string;
  description: string;
}

export interface GetDowntimeBannerSettingsData {
  downtimeBanner: (DowntimeBannerData & { name: DowntimeBannerVariant }) | null;
}

export interface UpdateDowntimeBannerSettingsVariables {
  name: DowntimeBannerVariant;
  set: {
    is_visible: boolean;
    title: string | null;
    description: string | null;
  };
}
