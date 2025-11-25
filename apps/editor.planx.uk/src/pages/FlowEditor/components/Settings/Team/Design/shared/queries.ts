import gql from "graphql-tag";

export const GET_TEAM_THEME = gql`
  query GetTeamTheme($teamId: Int!) {
    themes: team_themes(where: { team_id: { _eq: $teamId } }, limit: 1) {
      id
      teamId: team_id
      primaryColour: primary_colour
      actionColour: action_colour
      linkColour: link_colour
      logo
      favicon
    }
  }
`;

export const UPDATE_TEAM_THEME = gql`
  mutation UpdateTeamTheme($teamId: Int!, $theme: team_themes_set_input!) {
    update_team_themes(where: { team_id: { _eq: $teamId } }, _set: $theme) {
      returning {
        id
        teamId: team_id
        primaryColour: primary_colour
        actionColour: action_colour
        linkColour: link_colour
        logo
        favicon
      }
    }
  }
`;
