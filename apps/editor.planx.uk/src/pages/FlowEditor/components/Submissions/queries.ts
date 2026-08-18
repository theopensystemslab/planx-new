import { gql } from "@apollo/client";

export const GET_TEAM_LOGO = gql`
  query GetTeamLogo($teamSlug: String!) {
    teamThemes: team_themes(where: { team: { slug: { _eq: $teamSlug } } }) {
      logo
      team {
        name
      }
    }
  }
`;
