import type { FlowStatus } from "@opensystemslab/planx-core/types";
import { gql } from "graphql-request";
import capitalize from "lodash/capitalize.js";

import { $public, getClient } from "./client/index.js";
import { userContext } from "./modules/auth/middleware.js";
import { publishFlow } from "./modules/flows/publish/service.js";
import type { Flow, Node } from "./types.js";

export interface GetFlowDataResponse {
  slug: string;
  name: string;
  data: Flow["data"];
  summary: string | null;
  description: string | null;
  isService: boolean;
  limitations: string | null;
  teamId: number;
  team: { slug: string };
  templatedFrom: string | null;
  publishedFlows:
    | {
        data: Flow["data"];
        id: number;
        createdAt: string;
        summary: string;
        publisherId: number;
      }[]
    | [];
}

// Get a flow's data (unflattened)
const getFlowData = async (id: string): Promise<GetFlowDataResponse> => {
  const { flow } = await $public.client.request<{
    flow: GetFlowDataResponse | null;
  }>(
    gql`
      query GetFlowData($id: uuid!) {
        flow: flows_by_pk(id: $id) {
          slug
          data
          name
          summary
          description
          isService: is_service
          limitations
          teamId: team_id
          team {
            slug
          }
          templatedFrom: templated_from
          publishedFlows: published_flows(
            limit: 1
            order_by: { created_at: desc }
          ) {
            data
            id
            createdAt: created_at
            summary
            publisherId: publisher_id
          }
        }
      }
    `,
    { id },
  );
  if (!flow) throw Error(`Unable to get flow with id ${id}`);

  return flow;
};

// Insert a new flow into the `flows` table
const createFlow = async ({
  teamId,
  slug,
  name,
  isTemplate,
  flowData,
  copiedFrom,
  templatedFrom,
  summary,
  description,
  limitations,
  isService,
}: {
  teamId: number;
  slug: string;
  name: string;
  isTemplate: boolean;
  flowData: Flow["data"];
  copiedFrom?: Flow["id"];
  templatedFrom?: Flow["id"];
  summary?: string;
  description?: string;
  limitations?: string;
  isService?: boolean;
}) => {
  const { client: $client } = getClient();
  const userId = userContext.getStore()?.user?.sub;

  try {
    const response = await $client.request<{
      insertFlow: {
        id: Flow["id"];
      };
    }>(
      gql`
        mutation InsertFlow(
          $team_id: Int!
          $slug: String!
          $name: String!
          $data: jsonb = {}
          $copied_from: uuid
          $templated_from: uuid
          $is_template: Boolean
          $summary: String
          $description: String
          $limitations: String
          $is_service: Boolean
        ) {
          insertFlow: insert_flows_one(
            object: {
              team_id: $team_id
              slug: $slug
              name: $name
              data: $data
              version: 1
              copied_from: $copied_from
              templated_from: $templated_from
              is_template: $is_template
              summary: $summary
              description: $description
              limitations: $limitations
              is_service: $is_service
            }
          ) {
            id
          }
        }
      `,
      {
        team_id: teamId,
        slug: slug,
        name: name,
        data: flowData,
        copied_from: copiedFrom,
        templated_from: templatedFrom,
        is_template: isTemplate,
        summary: summary,
        description: description,
        limitations: limitations,
        is_service: isService,
      },
    );

    const flowId = response.insertFlow.id;

    await createAssociatedOperation(flowId);
    await publishFlow(flowId, "Created flow");

    return { id: flowId };
  } catch (error) {
    const copyInfo = copiedFrom ? ` (copied from ${copiedFrom})` : '';
    const templateInfo = templatedFrom ? ` (templated from ${templatedFrom})` : '';

    throw Error(
      `User ${userId} failed to insert flow to teamId ${teamId}${copyInfo}${templateInfo}. Please check permissions. Error: ${error}`,
    );
  }
};

// Add a row to `operations` for an inserted flow, otherwise ShareDB throws a silent error when opening the flow in the UI
const createAssociatedOperation = async (flowId: Flow["id"]) => {
  const { client: $client } = getClient();
  const data = await $client.request<{ operation: { id: string } }>(
    gql`
      mutation InsertOperation($flow_id: uuid!, $data: jsonb = {}) {
        operation: insert_operations_one(
          object: { flow_id: $flow_id, version: 1, data: $data }
        ) {
          id
        }
      }
    `,
    {
      flow_id: flowId,
    },
  );

  return data?.operation;
};

interface PublishedFlowsResponse {
  flow: {
    publishedFlows: {
      data?: Flow["data"];
      id?: number;
      createdAt?: string;
    }[];
  } | null;
}

// Get the most recent version of a published flow's data (flattened, with external portal nodes)
const getMostRecentPublishedFlow = async (
  id: string,
): Promise<Flow["data"] | undefined> => {
  const { flow } = await $public.client.request<PublishedFlowsResponse>(
    gql`
      query GetMostRecentPublishedFlow($id: uuid!) {
        flow: flows_by_pk(id: $id) {
          publishedFlows: published_flows(
            limit: 1
            order_by: { created_at: desc }
          ) {
            data
          }
        }
      }
    `,
    { id },
  );

  const mostRecent = flow?.publishedFlows?.[0]?.data;
  return mostRecent;
};

const getMostRecentPublishedFlowVersion = async (
  id: string,
): Promise<number | undefined> => {
  const { flow } = await $public.client.request<PublishedFlowsResponse>(
    gql`
      query GetMostRecentPublishedFlowVersion($id: uuid!) {
        flow: flows_by_pk(id: $id) {
          publishedFlows: published_flows(
            limit: 1
            order_by: { created_at: desc }
          ) {
            id
          }
        }
      }
    `,
    { id },
  );

  const mostRecent = flow?.publishedFlows?.[0]?.id;
  return mostRecent;
};

export const getMostRecentPublishedFlowDate = async (
  id: string,
): Promise<string | undefined> => {
  const { flow } = await $public.client.request<PublishedFlowsResponse>(
    gql`
      query GetMostRecentPublishedFlowVersion($id: uuid!) {
        flow: flows_by_pk(id: $id) {
          publishedFlows: published_flows(
            limit: 1
            order_by: { created_at: desc }
          ) {
            createdAt: created_at
          }
        }
      }
    `,
    { id },
  );

  const mostRecent = flow?.publishedFlows?.[0]?.createdAt;
  return mostRecent;
};

export interface FlowHistoryEntry {
  id: number;
  createdAt: string;
  firstName: string;
  lastName: string;
  type: "comment" | "operation";
  comment: string | null;
  data: unknown; // Operation["data"] via editor's sharedb json OT types
}

// Get comments and operations from a flow's "History" since last publish
export const getHistory = async (flowId: string) => {
  const lastPublishedAt = await getMostRecentPublishedFlowDate(flowId);
  if (!lastPublishedAt) return null;

  const { client: $client } = getClient();
  const response = await $client.request<{ history: FlowHistoryEntry[] }>(
    gql`
      query GetHistory($flow_id: uuid!, $last_published_at: timestamptz) {
        history: flow_history(
          where: {
            flow_id: { _eq: $flow_id }
            type: { _nin: "publish" }
            created_at: { _gt: $last_published_at }
          }
          order_by: { created_at: desc }
        ) {
          id
          createdAt: created_at
          firstName: first_name
          lastName: last_name
          type
          data
          comment
        }
      }
    `,
    {
      flow_id: flowId,
      last_published_at: lastPublishedAt,
    },
  );

  return response.history;
};

interface GetTemplatedFlowsResponse {
  templatedFlows: {
    id: string;
    slug: string;
    team: {
      slug: string;
    };
    status: FlowStatus;
  }[];
}

// Get templatedFlows info to display in the publishing modal when a flow "isTemplate"
export const getTemplatedFlows = async (flowId: string) => {
  const { client: $client } = getClient();
  const response = await $client.request<{ flow: GetTemplatedFlowsResponse }>(
    gql`
      query GetTemplatedFlows($flow_id: uuid!) {
        flow: flows_by_pk(id: $flow_id) {
          templatedFlows: templated_flows(
            where: { archived_at: { _is_null: true } }
          ) {
            id
            slug
            team {
              slug
            }
            status
          }
        }
      }
    `,
    {
      flow_id: flowId,
    },
  );

  return response.flow;
};

interface GetTemplatedFlowEditsResponse {
  templatedFrom: string | null;
  edits: {
    data: Flow["data"] | null; // not FlowGraph because no `_root`
  } | null;
}

export const getTemplatedFlowEdits = async (flowId: string) => {
  const { client: $client } = getClient();
  const response = await $client.request<{
    flow: GetTemplatedFlowEditsResponse;
  }>(
    gql`
      query GetTemplatedFlowEdits($flow_id: uuid!) {
        flow: flows_by_pk(id: $flow_id) {
          templatedFrom: templated_from
          edits: templated_flow_edit {
            data
          }
        }
      }
    `,
    {
      flow_id: flowId,
    },
  );

  return response.flow;
};

/**
 * For any node with edges, recursively find all of its' children nodes and return them as their own flow-like data structure
 */
const getChildren = (
  node: Node,
  originalFlow: Flow["data"],
  newFlow: Flow["data"],
): Flow["data"] => {
  if (node.edges) {
    node.edges.forEach((edgeId) => {
      if (!Object.keys(newFlow).includes(edgeId)) {
        newFlow[edgeId] = originalFlow[edgeId];
        getChildren(originalFlow[edgeId], originalFlow, newFlow);
      }
    });
  }

  return newFlow;
};

/**
 * For a given flow, make it unique by renaming its' node ids (replace last n characters) while preserving its' content
 */
const makeUniqueFlow = (
  flowData: Flow["data"],
  replaceValue: string,
): Flow["data"] => {
  const charactersToReplace = replaceValue.length;

  Object.keys(flowData).forEach((node) => {
    // if this node has edges, rename them (includes _root.edges)
    if (flowData[node]["edges"]) {
      const newEdges = flowData[node]["edges"]?.map(
        (edge) => edge.slice(0, -charactersToReplace) + replaceValue,
      );
      delete flowData[node]["edges"];
      flowData[node]["edges"] = newEdges;
    }

    // rename this top-level node if it's not _root
    if (node !== "_root") {
      const newNodeId = node.slice(0, -charactersToReplace) + replaceValue;
      flowData[newNodeId] = flowData[node];
      delete flowData[node];
    }
  });

  return flowData;
};

const isLiveEnv = () =>
  ["production", "staging", "pizza"].includes(process.env.NODE_ENV || "");

/**
 * Get current environment, formatted for display
 */
const getFormattedEnvironment = (): string => {
  let environment = process.env.NODE_ENV;
  if (environment === "pizza") {
    const pizzaNumber = new URL(process.env.API_URL_EXT!).href.split(".")[1];
    environment += ` ${pizzaNumber}`;
  }
  // For readability redefine development as local for slack warnings
  if (environment === "development") {
    environment = "local";
  }
  return capitalize(environment);
};

export {
  createFlow,
  getChildren,
  getFlowData,
  getFormattedEnvironment,
  getMostRecentPublishedFlow,
  getMostRecentPublishedFlowVersion,
  isLiveEnv,
  makeUniqueFlow,
};
