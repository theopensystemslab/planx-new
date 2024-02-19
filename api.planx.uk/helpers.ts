import { gql } from "graphql-request";
import { capitalize } from "lodash";
import { Flow, Node } from "./types";
import { ComponentType, FlowGraph } from "@opensystemslab/planx-core/types";
import { $public, getClient } from "./client";

export interface FlowData { 
  slug: string;
  data: Flow["data"];
  team_id: number;
  team: { "slug": string; };
  publishedFlows: { "data": Flow["data"]; }[] | [];
}

// Get a flow's data (unflattened, without external portal nodes)
const getFlowData = async (id: string): Promise<FlowData> => {
  const { flow } = await $public.client.request<{ flow: FlowData | null }>(
    gql`
      query GetFlowData($id: uuid!) {
        flow: flows_by_pk(id: $id) {
          slug
          data
          team_id
          team {
            slug
          }
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
  if (!flow) throw Error(`Unable to get flow with id ${id}`);

  return flow;
};

interface InsertFlow {
  flow: {
    id: string;
  };
}

// Insert a new flow into the `flows` table
const insertFlow = async (
  teamId: number,
  slug: string,
  flowData: Flow["data"],
  creatorId?: number,
  copiedFrom?: Flow["id"],
) => {
  const { client: $client } = getClient();
  try {
    const {
      flow: { id },
    } = await $client.request<InsertFlow>(
      gql`
        mutation InsertFlow(
          $team_id: Int!
          $slug: String!
          $data: jsonb = {}
          $creator_id: Int
          $copied_from: uuid
        ) {
          flow: insert_flows_one(
            object: {
              team_id: $team_id
              slug: $slug
              data: $data
              version: 1
              creator_id: $creator_id
              copied_from: $copied_from
            }
          ) {
            id
          }
        }
      `,
      {
        team_id: teamId,
        slug: slug,
        data: flowData,
        creator_id: creatorId,
        copied_from: copiedFrom,
      },
    );

    await createAssociatedOperation(id);
    return { id };
  } catch (error) {
    throw Error(
      `User ${creatorId} failed to insert flow to teamId ${teamId}. Please check permissions. Error: ${error}`,
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

interface PublishedFlows {
  flow: {
    publishedFlows: {
      // TODO: use FlowGraph from planx-core here
      data: Flow["data"];
    }[];
  } | null;
}

// Get the most recent version of a published flow's data (flattened, with external portal nodes)
const getMostRecentPublishedFlow = async (
  id: string,
): Promise<Flow["data"] | undefined> => {
  const { flow } = await $public.client.request<PublishedFlows>(
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

// Flatten a flow's data to include main content & portals in a single JSON representation
// XXX: getFlowData & dataMerged are currently repeated in ../editor.planx.uk/src/lib/dataMergedHotfix.ts
//        in order to load frontend /preview routes for flows that are not published
const dataMerged = async (
  id: string,
  ob: { [key: string]: Node } = {},
  isPortal: boolean = false,
  draftDataOnly: boolean = false,
): Promise<FlowGraph> => {  
  // get the primary draft flow data, checking for the latest published version of external portals
  let { slug, data, team, publishedFlows } = await getFlowData(id);

  // only flatten portals that are published, unless we're loading all draft data on an /unpublished route
  if (isPortal && !draftDataOnly) {
    if (publishedFlows?.[0]?.data) {
      data = publishedFlows[0].data;
    } else {
      throw new Error(`Publish flow ${team.slug}/${slug} before proceeding. All flows used as external portals must be published.`);
    }
  }

  // recursively get and flatten internal portals & external portals
  for (const [nodeId, node] of Object.entries(data)) {
    const isExternalPortalRoot =
      nodeId === "_root" && Object.keys(ob).length > 0;
    const isExternalPortal = node.type === ComponentType.ExternalPortal;
    const isMerged = ob[node.data?.flowId];

    // Merge portal root as a new node in the graph
    if (isExternalPortalRoot) {
      ob[id] = {
        ...node,
        type: ComponentType.InternalPortal,
        data: { text: slug },
      };
    }

    // Merge as internal portal, with reference to flowId
    else if (isExternalPortal) {
      ob[nodeId] = {
        type: ComponentType.InternalPortal,
        edges: [node.data?.flowId],
      };

      // Recursively merge flow
      if (!isMerged) {
        await dataMerged(node.data?.flowId, ob, true, draftDataOnly);
      }
    }

    // Merge all other nodes
    else ob[nodeId] = node;
  }

  // TODO: Don't cast here once types updated across API
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
  dataMerged,
  getChildren,
  makeUniqueFlow,
  insertFlow,
  isLiveEnv,
  getFormattedEnvironment,
};
