import { gql } from "graphql-request";
import { capitalize } from "lodash";
import { adminGraphQLClient as adminClient } from "./hasura";
import { Flow, Node } from "./types";
import { ComponentType, FlowGraph } from "@opensystemslab/planx-core/types";
import { getClient } from "./client";

// Get a flow's data (unflattened, without external portal nodes)
const getFlowData = async (id: string): Promise<Flow> => {
  const { client: $client } = getClient();
  const { flow } = await $client.request<{ flow: Flow | null}>(
    gql`
      query GetFlowData($id: uuid!) {
        flow: flows_by_pk(id: $id) {
          slug
          data
          team_id
        }
      }
    `,
    { id },
  );
  if (!flow) throw Error(`Unable to get flow with id ${id}`);

  return flow;
};

// Insert a new flow into the `flows` table
const insertFlow = async (
  teamId: number,
  slug: string,
  flowData: Flow["data"],
  creatorId?: number,
  copiedFrom?: Flow["id"],
) => {
  const { client: $client } = getClient();
  const data = await $client.request<{ flow: { id: string } }>(
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

  if (data) await createAssociatedOperation(data?.flow?.id);
  return data?.flow;
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

// Get the most recent version of a published flow's data (flattened, with external portal nodes)
const getMostRecentPublishedFlow = async (
  id: string,
): Promise<Flow["data"]> => {
  const data = await adminClient.request(
    gql`
      query GetMostRecentPublishedFlow($id: uuid!) {
        flows_by_pk(id: $id) {
          published_flows(limit: 1, order_by: { created_at: desc }) {
            data
          }
        }
      }
    `,
    { id },
  );

  return data.flows_by_pk.published_flows?.[0]?.data;
};

// Get the snapshot of the published flow for a certain point in time (flattened, with external portal nodes)
//   created_at refers to published date, value passed in as param should be lowcal_session.updated_at
const getPublishedFlowByDate = async (id: string, created_at: string) => {
  const data = await adminClient.request(
    gql`
      query GetPublishedFlowByDate($id: uuid!, $created_at: timestamptz!) {
        flows_by_pk(id: $id) {
          published_flows(
            limit: 1
            order_by: { created_at: desc }
            where: { created_at: { _lte: $created_at } }
          ) {
            data
          }
        }
      }
    `,
    {
      id,
      created_at,
    },
  );

  return data.flows_by_pk.published_flows?.[0]?.data;
};

// Flatten a flow's data to include main content & portals in a single JSON representation
// XXX: getFlowData & dataMerged are currently repeated in ../editor.planx.uk/src/lib/dataMergedHotfix.ts
//        in order to load frontend /preview routes for flows that are not published
const dataMerged = async (
  id: string,
  ob: { [key: string]: Node } = {},
): Promise<FlowGraph> => {
  // get the primary flow data
  const { slug, data } = await getFlowData(id);

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
        await dataMerged(node.data?.flowId, ob);
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
  ["production", "staging", "pizza", "sandbox"].includes(
    process.env.NODE_ENV || "",
  );

/**
 * Get current environment, formatted for display
 */
const getFormattedEnvironment = (): string => {
  let environment = process.env.NODE_ENV;
  if (environment === "pizza") {
    const pizzaNumber = new URL(process.env.API_URL_EXT!).href.split(".")[1];
    environment += ` ${pizzaNumber}`;
  }
  return capitalize(environment);
};

export {
  getFlowData,
  getMostRecentPublishedFlow,
  getPublishedFlowByDate,
  dataMerged,
  getChildren,
  makeUniqueFlow,
  insertFlow,
  isLiveEnv,
  getFormattedEnvironment,
};
