import { TEST_EMAIL } from "../../../ui-driven/src/helpers/globalHelpers";
import { $admin } from "../client";
import { safely } from "../globalHelpers";
import gql from "graphql-tag";

export const cleanup = async () => {
  await $admin.user._destroyAll();
  await $admin.team._destroyAll();
};

export async function createDemoUser(demoTeamId: number) {
  const variables = {
    firstName: "Test",
    lastName: "Test",
    email: TEST_EMAIL,
    teamId: demoTeamId,
    role: "demoUser",
  };

  const response = await safely(() =>
    $admin.client.request<{ insertUsersOne: { id: number } }>(
      gql`
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
              teams: { data: { role: $role, team_id: $teamId } }
            }
          ) {
            id
          }
        }
      `,
      variables,
    ),
  );

  const userId = response.insertUsersOne.id;
  return userId;
}
