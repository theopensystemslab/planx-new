import assert from "assert";
import { gql } from 'graphql-request';
import { adminGraphQLClient } from "./hasura";
import { Flow, Node } from "./types";

const client = adminGraphQLClient;

// Get a flow's data (unflattened, without external portal nodes)
const getFlowData = async (id: string): Promise<Flow> => {
  const data = await client.request(
    gql`
      query GetFlowData($id: uuid!) {
        flows_by_pk(id: $id) {
          slug
          data
          team_id
        }
      }
      `,
    { id }
  );

  return data.flows_by_pk;
};

// Insert a new flow into the `flows` table
const insertFlow = async (teamId: number, slug: string, flowData: Flow["data"], creatorId?: number, copiedFrom?: Flow["id"]) => {
  const data = await client.request(
    gql`
      mutation InsertFlow ($team_id: Int!, $slug: String!, $data: jsonb = {}, $creator_id: Int, $copied_from: uuid) {
        insert_flows_one(object: {
          team_id: $team_id,
          slug: $slug,
          data: $data,
          version: 1,
          creator_id: $creator_id
          copied_from: $copied_from
        }) {
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
    }
  );

  if (data) await createAssociatedOperation(data?.insert_flows_one?.id);
  return data?.insert_flows_one;
};

// Add a row to `operations` for an inserted flow, otherwise ShareDB throws a silent error when opening the flow in the UI
const createAssociatedOperation = async (flowId: Flow["id"]) => {
  const data = await client.request(
    gql`
      mutation InsertOperation ($flow_id: uuid!, $data: jsonb = {}) {
        insert_operations_one(object: { flow_id: $flow_id, version: 1, data: $data }) {
          id
        }
      }
    `,
    {
      flow_id: flowId,
    }
  );

  return data?.insert_operations_one;
};

// Get the most recent version of a published flow's data (flattened, with external portal nodes)
const getMostRecentPublishedFlow = async (id: string): Promise<Flow["data"]> => {
  const data = await client.request(
    gql`
      query GetMostRecentPublishedFlow($id: uuid!) {
        flows_by_pk(id: $id) {
          published_flows(limit: 1, order_by: { created_at: desc }) {
            data
          }
        }
      }
    `,
    { id }
  );

  return data.flows_by_pk.published_flows?.[0]?.data;
};

// Get the snapshot of the published flow for a certain point in time (flattened, with external portal nodes)
//   created_at refers to published date, value passed in as param should be lowcal_session.updated_at
const getPublishedFlowByDate = async (id: string, created_at: string) => {
  const data = await client.request(
    gql`
      query GetPublishedFlowByDate($id: uuid!, $created_at: timestamptz!) {
        flows_by_pk(id: $id) {
          published_flows(
            limit: 1,
            order_by: { created_at: desc },
            where: { created_at: {_lte: $created_at} }
          ) {
            data
          }
        }
      }
    `,
    {
      id,
      created_at,
    }
  );

  return data.flows_by_pk.published_flows?.[0]?.data;
};

// Flatten a flow's data to include main content & portals in a single JSON representation
// XXX: getFlowData & dataMerged are currently repeated in ../editor.planx.uk/src/lib/dataMergedHotfix.ts
//        in order to load frontend /preview routes for flows that are not published
const dataMerged = async (id: string, ob: Record<string, any> = {}) => {
  // get the primary flow data
  const { slug, data } = await getFlowData(id);

  // recursively get and flatten internal portals (type 300) & external portals (type 310)
  for (const [nodeId, node] of Object.entries(data)) {
    if (nodeId === "_root" && Object.keys(ob).length > 0) {
      ob[id] = {
        ...node,
        type: 300,
        data: { text: slug },
      };
    } else if (node.type === 310 && !ob[node.data?.flowId]) {
      await dataMerged(node.data?.flowId, ob);
      ob[nodeId] = {
        type: 300,
        edges: [node.data?.flowId],
      };
    } else {
      ob[nodeId] = node;
    }
  }
  return ob;
};

/**
 * For any node with edges, recursively find all of its' children nodes and return them as their own flow-like data structure
 */
const getChildren = (
  node: Node,
  originalFlow: Flow["data"],
  newFlow: Flow["data"]
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
const makeUniqueFlow = (flowData: Flow["data"], replaceValue: string): Flow["data"] => {
  const charactersToReplace = replaceValue.length;

  Object.keys(flowData).forEach((node) => {
    // if this node has edges, rename them (includes _root.edges)
    if (flowData[node]["edges"]) {
      const newEdges = flowData[node]["edges"]?.map(
        (edge) => edge.slice(0, -charactersToReplace) + replaceValue
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

const getEnvironment = (): string | undefined => {
  const url = new URL(process.env.API_URL_EXT!);
  if (url.hostname.endsWith(".uk")) return "Production"
  if (url.hostname.endsWith(".dev")) return "Staging"
  if (url.hostname.endsWith(".pizza")) return `Pizza ${url.href.split(".")[1]}`
  if (url.href.includes("localhost")) return "Development"
};

export {
  getFlowData,
  getMostRecentPublishedFlow,
  getPublishedFlowByDate,
  dataMerged,
  getChildren,
  makeUniqueFlow,
  insertFlow,
  getEnvironment,
};
