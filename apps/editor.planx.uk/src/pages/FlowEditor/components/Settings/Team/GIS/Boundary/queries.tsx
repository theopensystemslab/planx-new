import { gql } from "@apollo/client";

export const GET_TEAM_SETTINGS = gql`
  query GetTeamSettings($slug: String!) {
    teams(where: { slug: { _eq: $slug } }, limit: 1) {
      id
      settings: team_settings {
        id
        boundaryUrl: boundary_url
        boundaryBBox: boundary_bbox
      }
    }
  }
`;

export const UPDATE_TEAM_SETTINGS = gql`
  mutation UpdateTeamSettings(
    $teamId: Int!
    $settings: team_settings_set_input!
  ) {
    update_team_settings(
      where: { team_id: { _eq: $teamId } }
      _set: $settings
    ) {
      returning {
        id
        boundaryUrl: boundary_url
        boundaryBBox: boundary_bbox
      }
    }
  }
`;
