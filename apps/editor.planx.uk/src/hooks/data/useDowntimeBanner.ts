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
  name: DowntimeBannerVariant;
  isVisible: boolean;
  title: string | null;
  description: string | null;
}

export interface FetchDowntimeBannerData {
  downtimeBanner: DowntimeBannerData | null;
}

export interface FetchDowntimeBannerVariables {
  name: DowntimeBannerVariant;
}

/**
 * Query `downtime_banner` direct via db so not deployment sensitive
 * Managed by platform admins via Global settings > Downtime banner
 */
export const useDowntimeBanner = (variant: DowntimeBannerVariant) =>
  useQuery<FetchDowntimeBannerData, FetchDowntimeBannerVariables>(
    FETCH_DOWNTIME_BANNER,
    {
      variables: { name: variant },
      context: publicContext,
    },
  );
