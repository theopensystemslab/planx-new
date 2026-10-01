import { gql } from "@apollo/client";

export const GET_TEAM_CATEGORY = gql`
  query GetTeamCategory($slug: String!) {
    teams(where: { slug: { _eq: $slug } }, limit: 1) {
      id
      category
    }
  }
`;

export const UPDATE_TEAM_CATEGORY = gql`
  mutation UpdateTeamCategory(
    $teamId: Int!
    $category: team_category_enum_enum!
  ) {
    update_teams_by_pk(
      pk_columns: { id: $teamId }
      _set: { category: $category }
    ) {
      id
      category
    }
  }
`;
