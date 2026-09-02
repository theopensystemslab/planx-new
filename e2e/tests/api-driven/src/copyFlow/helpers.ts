import { gql } from "graphql-tag";

import { $admin } from "../client.js";
import { createTeam, createUser } from "../globalHelpers.js";
import { buildJWT } from "../jwt.js";
import { addUserToTeam } from "../permissions/helpers.js";

export const REPLACE_VALUE = "EEEEE";

// mirrors rename_node_id() in the copy_flow SQL migration / renameNodeId() in helpers.ts
export const renameNodeId = (nodeId: string, replaceValue: string) =>
  nodeId.slice(0, -replaceValue.length) + replaceValue;

interface Setup {
  teamId: number;
  otherTeamId: number;
  jwt: string;
  otherTeamJwt: string;
  sourceFlowId: string;
}

export const setup = async (): Promise<Setup> => {
  const teamId = await createTeam({
    name: "E2E Copy Flow Team",
    slug: "e2e-copy-flow-team",
  });
  const otherTeamId = await createTeam({
    name: "E2E Copy Flow Other Team",
    slug: "e2e-copy-flow-other-team",
  });

  const email = "copy-flow-e2e-user@example.com";
  const otherTeamEmail = "copy-flow-e2e-other-user@example.com";

  const userId = await createUser({ email });
  await addUserToTeam(userId, teamId);

  const otherTeamUserId = await createUser({ email: otherTeamEmail });
  await addUserToTeam(otherTeamUserId, otherTeamId);

  const jwt = await buildJWT(email);
  const otherTeamJwt = await buildJWT(otherTeamEmail);
  if (!jwt || !otherTeamJwt) throw new Error("Unable to build test JWTs");

  const sourceFlowId = await $admin.flow.create({
    teamId,
    slug: "e2e-copy-flow-source",
    name: "E2E copy_flow source",
    userId,
    data: { _root: { edges: ["soloNode", "cloneNode"] } },
  });

  return { teamId, otherTeamId, jwt, otherTeamJwt, sourceFlowId };
};

interface CallCopyEndpointArgs {
  jwt?: string;
  flowId: string;
  teamId: number;
  slug: string;
  name?: string;
  insert?: boolean;
  replaceValue?: string;
}

export const callCopyEndpoint = async ({
  jwt,
  flowId,
  teamId,
  slug,
  name = "E2E copy_flow destination",
  insert = true,
  replaceValue = REPLACE_VALUE,
}: CallCopyEndpointArgs) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (jwt) headers["Authorization"] = `Bearer ${jwt}`;

  const response = await fetch(
    `${process.env.API_URL_EXT}/flows/${flowId}/copy`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ teamId, slug, name, insert, replaceValue }),
    },
  );

  return {
    status: response.status,
    body: await response.json(),
  };
};

export const getFlowBySlug = async (slug: string) => {
  const { flows } = await $admin.client.request<{
    flows: { id: string; teamId: number }[];
  }>(
    gql`
      query GetFlowBySlug($slug: String!) {
        flows(where: { slug: { _eq: $slug } }) {
          id
          teamId: team_id
        }
      }
    `,
    { slug },
  );
  return flows[0] as { id: string; teamId: number } | undefined;
};

export const getOperations = async (flowId: string) => {
  const { operations } = await $admin.client.request<{
    operations: { id: number }[];
  }>(
    gql`
      query GetOperations($flowId: uuid!) {
        operations(where: { flow_id: { _eq: $flowId } }) {
          id
        }
      }
    `,
    { flowId },
  );
  return operations;
};

export const cleanup = async () => {
  await $admin.flow._destroyPublishedAll();
  await $admin.flow._destroyAll();
  await $admin.user._destroyAll();
  await $admin.team._destroyAll();
};
