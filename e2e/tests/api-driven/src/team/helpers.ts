import { $admin } from "../client.js";
import { createTeam, createUser } from "../globalHelpers.js";
import { addUserToTeam } from "../permissions/helpers.js";
import { gql } from "graphql-tag";

const firstNames = [
  "Alice",
  "Bob",
  "Charlie",
  "Diana",
  "Edward",
  "Fiona",
  "George",
  "Hannah",
  "Joe",
  "Liz",
  "Hazel",
];
const lastNames = [
  "Smith",
  "Jones",
  "Brown",
  "Wilson",
  "Taylor",
  "Anderson",
  "Thomas",
  "Moore",
  "Johnson",
  "Appleseed",
];

export const setup20ActiveMembers = async () => {
  const teamId = await createTeam({
    name: "E2E Test Team - Max Users",
    slug: "e2e-max-users",
    settings: { homepage: "http://www.planx.uk" },
  });

  const userIds: number[] = [];
  for (let i = 0; i < 20; i++) {
    const userId = await createUser({
      firstName: firstNames[i < 11 ? i : i - 10],
      lastName: lastNames[i < 10 ? i : i - 10],
      email: `user${i + 1}@example.com`,
    });
    userIds.push(userId);
    await addUserToTeam(userId, teamId);
  }

  return { teamId, userIds };
};

export const setup19ActiveAnd2ArchivedMembers = async () => {
  const teamId = await createTeam({
    name: "E2E Test Team - 19 Active",
    slug: "e2e-19-active",
    settings: { homepage: "http://www.planx.uk" },
  });

  const activeUserIds: number[] = [];
  for (let i = 0; i < 19; i++) {
    const userId = await createUser({
      firstName: firstNames[i < 11 ? i : i - 10],
      lastName: lastNames[i < 10 ? i : i - 10],
      email: `active${i + 1}@example.com`,
    });
    activeUserIds.push(userId);
    await addUserToTeam(userId, teamId);
  }

  const archivedUserIds: number[] = [];
  for (let i = 0; i < 2; i++) {
    const userId = await createUser({
      firstName: `Archived${i + 1}`,
      lastName: "User",
      email: `archived${i + 1}@example.com`,
    });
    archivedUserIds.push(userId);
    await addUserToTeam(userId, teamId);
    await archiveUser(userId);
  }

  return { teamId, activeUserIds, archivedUserIds };
};

export const archiveUser = async (userId: number) => {
  // REMOVE_TEAM_MEMBER equivalent mutation
  await $admin.client.request(
    gql`
      mutation SoftDeleteUserById($id: Int!) {
        users: update_users_by_pk(
          pk_columns: { id: $id }
          _set: { email: null }
        ) {
          id
          email
        }
      }
    `,
    { id: userId },
  );
};

export const cleanup = async () => {
  await $admin.user._destroyAll();
  await $admin.team._destroyAll();
};
