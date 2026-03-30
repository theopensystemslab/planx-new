import gql from "graphql-tag";

export const GET_TEAM_CONSTRAINTS = gql`
  query GetTeamConstraints($teamId: Int!) {
    integrations: team_integrations(where: { team_id: { _eq: $teamId } }) {
      hasPlanningData: has_planning_data
    }
  }
`;

export const UPDATE_TEAM_CONSTRAINTS = gql`
  mutation UpdateTeamConstraints(
    $teamId: Int!
    $hasPlanningData: Boolean!
  ) {
    update_team_integrations(
      where: { team_id: { _eq: $teamId } }
      _set: { has_planning_data: $hasPlanningData }
    ) {
      returning {
        hasPlanningData: has_planning_data
      }  
    }
  }
`;
