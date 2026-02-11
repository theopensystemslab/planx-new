import type { FlowGraph, FlowStatus } from "@opensystemslab/planx-core/types";
import { ComponentType } from "@opensystemslab/planx-core/types";
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
  limitations: string | null;
  team_id: number;
  team: { slug: string };
  templatedFrom: string | null;
  publishedFlows:
    | {
        data: Flow["data"];
        id: number;
        created_at: string;
        summary: string;
        publisher_id: number;
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
          limitations
          team_id
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
            created_at
            summary
            publisher_id
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
}) => {
  const { client: $client } = getClient();
  const userId = userContext.getStore()?.user?.sub;

  try {
    const response = await $client.request<{
      insertFlowWithIntegration: {
        id: Flow["id"];
      };
    }>(
      gql`
        mutation InsertFlowWithIntegration(
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
          $email_id: uuid
        ) {
          insertFlowWithIntegration: insert_flows_one(
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
              flow_integration: {
                data: { team_id: $team_id, email_id: $email_id }
              }
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
      },
    );

    const flowId = response.insertFlowWithIntegration.id;

    await createAssociatedOperation(flowId);
    await publishFlow(flowId, "Created flow");

    return { id: flowId };
  } catch (error) {
    throw Error(
      `User ${userId} failed to insert flow to teamId ${teamId}. Please check permissions. Error: ${error}`,
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
            where: { deleted_at: { _is_null: true } }
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
 * Flatten a flow to create a single JSON representation of the main flow data and any external portals
 *   By default, requires that any external portals are published and flattens their latest published version
 *   When draftDataOnly = true, flattens the draft data of the main flow and the draft data of any external portals published or otherwise
 */
const dataMerged = async (
  id: string,
  ob: { [key: string]: Node } = {},
  isPortal = false,
  draftDataOnly = false,
): Promise<FlowGraph> => {
  // get the primary draft flow data, including its' latest published version
  const response = await getFlowData(id);
  const { slug, team, publishedFlows } = response;
  let { data } = response;

  // only flatten external portals that are published, unless we're loading draftDataOnly
  if (isPortal && !draftDataOnly) {
    if (publishedFlows?.[0]?.data) {
      data = publishedFlows[0].data;
    } else {
      throw new Error(
        `Publish flow ${team.slug}/${slug} before proceeding. All flows used as external portals must be published.`,
      );
    }
  }

  // recursively get and flatten external portals
  for (const [nodeId, node] of Object.entries(data)) {
    const isExternalPortalRoot =
      nodeId === "_root" && Object.keys(ob).length > 0;
    const isExternalPortal = node.type === ComponentType.ExternalPortal;
    const isMerged = ob[node.data?.flowId];

    // merge external portal _root node as a new node in the graph using its' flowId as nodeId
    if (isExternalPortalRoot) {
      ob[id] = {
        ...node, // includes _root edges for navigation to all child nodes in this portal
        type: ComponentType.InternalPortal,
        data: {
          text: `${team.slug}/${slug}`,
          flattenedFromExternalPortal: true,
          templatedFrom: response.templatedFrom,
          // add extra metadata about latest published version when applicable
          ...(!draftDataOnly && {
            publishedFlowId: publishedFlows?.[0]?.id,
            publishedAt: publishedFlows?.[0]?.created_at,
            publishedBy: publishedFlows?.[0]?.publisher_id,
            summary: publishedFlows?.[0]?.summary,
          }),
        },
      };
    }

    // merge external portal type node as an internal portal type node, with an edge pointing to flowId (to navigate to the externalPortalRoot set above)
    else if (isExternalPortal) {
      ob[nodeId] = {
        type: ComponentType.InternalPortal,
        edges: [node.data?.flowId],
        data: {
          flattenedFromExternalPortal: true,
        },
      };

      // recursively merge flow
      if (!isMerged) {
        await dataMerged(node.data?.flowId, ob, true, draftDataOnly);
      }
    }

    // merge all other nodes
    else ob[nodeId] = node;
  }

  // for every external portal that has been merged, confirm its' latest version was merged. If not, overwrite older snapshot with newest version
  //   ** this is a final/separate step because older snapshots can be nested in _already_ flattened data (eg not picked up as ComponentType.ExternalPortal above)
  if (!draftDataOnly) {
    for (const [nodeId, node] of Object.entries(ob).filter(
      ([_nodeId, node]) => node.data?.publishedFlowId,
    )) {
      const mostRecentPublishedFlowId =
        await getMostRecentPublishedFlowVersion(nodeId);
      if (mostRecentPublishedFlowId !== node.data?.publishedFlowId) {
        await dataMerged(nodeId, ob, true, draftDataOnly);
      }
    }
  }

  return ob as FlowGraph;
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
  getFlowData,
  getMostRecentPublishedFlow,
  getMostRecentPublishedFlowVersion,
  dataMerged,
  getChildren,
  makeUniqueFlow,
  createFlow,
  isLiveEnv,
  getFormattedEnvironment,
};
