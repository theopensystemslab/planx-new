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

export const UPDATE_USER_ONLY = gql`
  mutation UpdateUser(
    $userId: Int!
    $userValues: users_set_input
    $teamId: Int
  ) {
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

export const CREATE_AND_ADD_EDITOR_TO_TEAM = gql`
  mutation CreateAndAddEditorToTeam(
    $email: String!
    $firstName: String!
    $lastName: String!
    $teamId: Int!
  ) {
    insertUsersOne: insert_users_one(
      object: {
        email: $email
        first_name: $firstName
        last_name: $lastName
        default_team_id: $teamId
        teams: { data: { role: teamEditor, team_id: $teamId } }
      }
    ) {
      id
      first_name
      last_name
      email
    }
  }
`;

/**
 * Our teamAdmin permission is a layer _on top of_ teamEditor
 * meaning there should be multiple records in team_members for the same user
 * so this mutation creates both a teamEditor _and_ teamAdmin record.
 */
export const CREATE_AND_ADD_ADMIN_TO_TEAM = gql`
  mutation CreateAndAddAdminToTeam(
    $email: String!
    $firstName: String!
    $lastName: String!
    $teamId: Int!
  ) {
    insertUsersOne: insert_users_one(
      object: {
        email: $email
        first_name: $firstName
        last_name: $lastName
        default_team_id: $teamId
        teams: {
          data: [
            { role: teamAdmin, team_id: $teamId }
            { role: teamEditor, team_id: $teamId }
          ]
        }
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
    users: update_users_by_pk(pk_columns: { id: $id }, _set: { email: null }) {
      id
      email
    }
  }
`;

/** Grants the existing user editor permissions _only_ for this team */
export const ADD_EXISTING_USER_TO_TEAM_AS_EDITOR = gql`
  mutation AddExistingUserToTeamAsEditor($teamId: Int!, $userId: Int!) {
    insert_team_members_one(
      object: { role: teamEditor, team_id: $teamId, user_id: $userId }
    ) {
      id
    }
  }
`;

/** Grants the existing user both team editor _and_ team admin permissions */
export const ADD_EXISTING_USER_TO_TEAM_AS_ADMIN = gql`
  mutation AddExistingUserToTeamAsAdmin($teamId: Int!, $userId: Int!) {
    insert_team_members(
      objects: [
        { role: teamEditor, team_id: $teamId, user_id: $userId }
        { role: teamAdmin, team_id: $teamId, user_id: $userId }
      ]
    ) {
      affected_rows
    }
  }
`;

export const CREATE_TEAM_ADMIN_ONLY = gql`
  mutation CreateTeamAdminOnly($teamId: Int!, $userId: Int!) {
    insert_team_members_one(
      object: { team_id: $teamId, role: teamAdmin, user_id: $userId }
    ) {
      id
    }
  }
`;

export const REMOVE_TEAM_ADMIN_ONLY = gql`
  mutation RemoveTeamAdminOnly($teamId: Int!, $userId: Int!) {
    DeleteTeamMembers: delete_team_members(
      where: {
        role: { _eq: teamAdmin }
        user_id: { _eq: $userId }
        team_id: { _eq: $teamId }
      }
    ) {
      affected_rows
    }
  }
`;

export const GET_USER_BY_EMAIL = gql`
  query GetUserByEmail($email: String!) {
    users(where: { email: { _eq: $email } }) {
      id
      firstName: first_name
      lastName: last_name
    }
  }
`;
