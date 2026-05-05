import { gql } from "graphql-tag";

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
    }
  }
`;
