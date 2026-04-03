import gql from "graphql-tag";

export const GET_ANALYSTS_QUERY = gql`
  query GetAnalysts {
    users(where: {is_analyst: {_eq: true}, email: {_is_null: false}}) {
      email
      firstName: first_name
      id
      lastName: last_name
      isAnalyst: is_analyst
      isPlatformAdmin: is_platform_admin
      defaultTeamId: default_team_id
      teams {
        role
        team {
          id
          name
          slug
        }
      }
    }
  }
`;