import { gql, useQuery } from "@apollo/client";
import { publicContext } from "lib/graphql/contexts";

const FETCH_DOWNTIME_BANNER_VISIBILITY = gql`
  query FetchDowntimeBannerVisibility {
    downtimeBanner: downtime_banner_by_pk(name: "DowntimeBanner") {
      isVisible: is_visible
    }
  }
`;

export interface DowntimeBanner {
  isVisible: boolean;
}

export const useDowntimeBanner = () =>
  useQuery<{ downtimeBanner: DowntimeBanner }>(
    FETCH_DOWNTIME_BANNER_VISIBILITY,
    {
      context: publicContext,
    },
  );
