import { $admin, getClient } from "../client";
import { CustomWorld } from "./steps";
import { queries } from "./queries";
import { createFlow, createTeam, createUser } from "../globalHelpers";

interface PerformGQLQueryArgs {
  world: CustomWorld;
  action: string;
  table: string;
}

export const addUserToTeam = async (userId: number, teamId: number) => {
  await $admin.team.addMember({
    userId,
    teamId,
    role: "teamEditor",
  });
};

export const cleanup = async () => {
  await $admin.flow._destroyAll();
  await $admin.team._destroyAll();
  await $admin.user._destroyAll();
}

export const setup = async () => {
  const teamId1 = await createTeam({ name: "E2E Team 1", slug: "e2e-team1" });
  const teamId2 = await createTeam({ name: "E2E Team 2", slug: "e2e-team2" });
  const user1 = {
    id: await createUser({ email: "e2e-user-1@opensystemslab.io" }),
    email: "e2e-user-1@opensystemslab.io",
  }
  const user2 = {
    id: await createUser({ email: "e2e-user-2@opensystemslab.io" }),
    email: "e2e-user-2@opensystemslab.io",
  }
  const team1Flow = await createFlow({ teamId: teamId1, slug: "team-1-flow" })
  const team2Flow = await createFlow({ teamId: teamId2, slug: "team-2-flow" })

  const world = {
    teamId1,
    teamId2,
    user1,
    user2,
    team1Flow,
    team2Flow,
  };

  return world;
}

export const performGQLQuery = async ({
  world,
  action,
  table,
}: PerformGQLQueryArgs) => {
  const query = queries[table][action];
  const client = (await getClient(world.activeUser.email)).client;
  const result = await client.request(query, { teamId1: world.teamId1 });
  return result;
};
