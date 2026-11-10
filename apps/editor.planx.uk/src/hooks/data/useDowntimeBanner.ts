import { gql, useQuery } from "@apollo/client";
import { publicContext } from "lib/graphql/contexts";

export type DowntimeBannerVariant = "editor" | "public";

export const FETCH_DOWNTIME_BANNER = gql`
  query FetchDowntimeBanner($name: String!) {
    downtimeBanner: downtime_banner_by_pk(name: $name) {
      name
      isVisible: is_visible
      title
      description
    }
  }
`;

export interface DowntimeBannerData {
  isVisible: boolean;
  title: string | null;
  description: string | null;
}

/**
 * Query `downtime_banner` direct via db so not deployment sensitive
 * Managed by platform admins via Global settings > Downtime banner
 */
export const useDowntimeBanner = (variant: DowntimeBannerVariant) =>
  useQuery<
    { downtimeBanner: DowntimeBannerData | null },
    { name: DowntimeBannerVariant }
  >(FETCH_DOWNTIME_BANNER, {
    variables: { name: variant },
    context: publicContext,
  });
