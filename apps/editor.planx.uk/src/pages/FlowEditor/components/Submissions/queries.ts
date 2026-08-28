import { gql } from "@apollo/client";

export const GET_TEAM_LOGO = gql`
  query GetTeamLogo($teamSlug: String!) {
    teams(where: { slug: { _eq: $teamSlug } }) {
      theme {
        logo
        primaryColour: primary_colour
      }
      id
      name
    }
  }
`;
