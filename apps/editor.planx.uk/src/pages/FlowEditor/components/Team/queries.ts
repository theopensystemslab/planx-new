import gql from "graphql-tag";

export const GET_USERS_FOR_TEAM_QUERY = gql`
  query GetUsersForTeam($teamSlug: String!) {
    users(
      where: {
        _or: [
          { is_platform_admin: { _eq: true } }
          { teams: { team: { slug: { _eq: $teamSlug } } } }
        ]
      }
      order_by: { first_name: asc }
    ) {
      id
      firstName: first_name
      lastName: last_name
      isPlatformAdmin: is_platform_admin
      email
      defaultTeamId: default_team_id
      teams(where: { team: { slug: { _eq: $teamSlug } } }) {
        role
      }
    }
  }
`;

export const UPDATE_TEAM_MEMBER = gql`
  mutation UpdateUser($userId: Int, $userValues: users_set_input) {
    update_users(where: { id: { _eq: $userId } }, _set: $userValues) {
      returning { 
        id
        firstName: first_name 
        lastName: last_name 
        email
       }
    }
  }
`;

export const CREATE_AND_ADD_USER_TO_TEAM = gql`
  mutation CreateAndAddUserToTeam(
    $email: String!
    $firstName: String!
    $lastName: String!
    $teamId: Int!
    $role: user_roles_enum!
  ) {
    insertUsersOne: insert_users_one(
      object: {
        email: $email
        first_name: $firstName
        last_name: $lastName
        default_team_id: $teamId
        teams: { data: { role: $role, team_id: $teamId } }
      }
    ) {
      id 
      first_name 
      last_name 
      email
    }
  }
`;

export const REMOVE_TEAM_MEMBER = gql`
  mutation SoftDeleteUserById($id: Int!) {
    users: update_users_by_pk(
      pk_columns: { id: $id }
      _set: { email: null }
    ) {
      id
      email
    }
  }
`;