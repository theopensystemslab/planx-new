import { DocumentNode, Kind } from "graphql/language";
import { $admin, getClient } from "../client";
import { CustomWorld } from "./steps";
import { queries } from "./queries";
import { createFlow, createTeam, createUser } from "../globalHelpers";

export type Action = "insert" | "update" | "delete" | "select";
export type Table = keyof typeof queries;

interface PerformGQLQueryArgs {
  world: CustomWorld;
  action: Action;
  table: Table;
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
};

export const setup = async () => {
  const user1Id = await createUser({
    email: "team1-teamEditor-user@example.com",
  });
  const teamId1 = await createTeam({ name: "E2E Team 1", slug: "e2e-team1" });
  const team1FlowId = await createFlow({
    teamId: teamId1,
    slug: "team-1-flow",
  });

  const user2Id = await createUser({
    email: "team2-teamEditor-user@example.com",
  });
  const teamId2 = await createTeam({ name: "E2E Team 2", slug: "e2e-team2" });
  const team2FlowId = await createFlow({
    teamId: teamId2,
    slug: "team-2-flow",
  });

  const world = {
    user1Id,
    teamId1,
    team1FlowId,
    user2Id,
    teamId2,
    team2FlowId,
  };

  return world;
};

export const performGQLQuery = async ({
  world,
  action,
  table,
}: PerformGQLQueryArgs) => {
  const query = queries[table][action];
  const variables = buildVariables(query, world);
  const client = (await getClient(world.activeUserEmail)).client;
  const { result } = await client.request<Record<"result", any>>(
    query,
    variables,
  );
  return result;
};

/**
 * Parse GQL query to extract variables required for query
 * Match with values from our test world to construct variables for query
 */
const buildVariables = (query: DocumentNode, world: CustomWorld) => {
  const variables = {};
  const definitionNode = query.definitions[0];

  if (definitionNode.kind !== Kind.OPERATION_DEFINITION) return variables;
  if (!definitionNode.variableDefinitions) return variables;

  Object.keys(world).forEach((key) => {
    const isVariableUsedInQuery = definitionNode.variableDefinitions!.find(
      (varDef) => varDef.variable.name.value === key,
    );
    if (isVariableUsedInQuery) {
      variables[key] = world[key];
    }
  });

  return variables;
};
