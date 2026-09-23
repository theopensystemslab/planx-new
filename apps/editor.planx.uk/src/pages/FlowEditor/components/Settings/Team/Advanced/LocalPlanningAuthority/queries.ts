import { gql } from "@apollo/client";

export const GET_TEAM_IS_LPA = gql`
  query GetTeamIsLpa($slug: String!) {
    teams(where: { slug: { _eq: $slug } }, limit: 1) {
      id
      isLpa: is_lpa
    }
  }
`;

export const UPDATE_TEAM_IS_LPA = gql`
  mutation UpdateTeamIsLpa($teamId: Int!, $isLpa: Boolean!) {
    update_teams_by_pk(pk_columns: { id: $teamId }, _set: { is_lpa: $isLpa }) {
      id
      isLpa: is_lpa
    }
  }
`;
