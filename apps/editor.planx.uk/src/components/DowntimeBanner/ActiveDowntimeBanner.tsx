import {
  type DowntimeBannerVariant,
  useDowntimeBanner,
} from "hooks/data/useDowntimeBanner";

import DowntimeBanner from "./DowntimeBanner";

/**
 * Displays the downtime banner configured for the given interface, if visible
 */
const ActiveDowntimeBanner: React.FC<{ variant: DowntimeBannerVariant }> = ({
  variant,
}) => {
  const { data } = useDowntimeBanner(variant);
  const banner = data?.downtimeBanner;

  if (!banner?.isVisible) return null;

  return (
    <DowntimeBanner title={banner.title} description={banner.description} />
  );
};

export default ActiveDowntimeBanner;
