import gql from "graphql-tag";

export const ANALYST_FRAGMENT = gql`
  fragment AnalystFragment on users {
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
`;

export const GET_ANALYSTS_QUERY = gql`
  ${ANALYST_FRAGMENT}
  query GetAnalysts {
    analysts: users(where: {is_analyst: {_eq: true}, email: {_is_null: false}}) {
      ...AnalystFragment
    }
  }
`;

export const INSERT_ANALYST = gql`
  ${ANALYST_FRAGMENT}
  mutation InsertAnalyst($email: String!, $firstName: String!, $lastName: String!) {
    analyst: insert_users_one(
      object: {
        email: $email, 
        first_name: $firstName, 
        is_analyst: true, 
        last_name: $lastName
      }
    ) {
      ...AnalystFragment
    }
  }
`;