import { gql } from "@apollo/client";

export const GET_DOWNTIME_BANNER_SETTINGS = gql`
  query GetDowntimeBannerSettings($name: String!) {
    downtimeBanner: downtime_banner_by_pk(name: $name) {
      name
      isVisible: is_visible
      title
      description
    }
  }
`;

export const UPDATE_DOWNTIME_BANNER_SETTINGS = gql`
  mutation UpdateDowntimeBannerSettings(
    $name: String!
    $set: downtime_banner_set_input!
  ) {
    update_downtime_banner_by_pk(pk_columns: { name: $name }, _set: $set) {
      name
      isVisible: is_visible
      title
      description
    }
  }
`;
