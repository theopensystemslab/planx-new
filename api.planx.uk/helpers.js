const { GraphQLClient } = require("graphql-request");

const client = new GraphQLClient(process.env.HASURA_GRAPHQL_URL, {
  headers: {
    "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET,
  },
});

// Get a flow's data (unflattened, without external portal nodes)
const getFlowData = async (id) => {
  const data = await client.request(
    `
      query GetFlowData($id: uuid!) {
        flows_by_pk(id: $id) {
          slug
          data
        }
      }
      `,
    { id }
  );

  return data.flows_by_pk;
};

// Get the most recent version of a published flow's data (flattened, with external portal nodes)
const getMostRecentPublishedFlow = async (id) => {
  const data = await client.request(
    `
      query GetMostRecentPublishedFlow($id: uuid!) {
        flows_by_pk(id: $id) {
          published_flows(limit: 1, order_by: { id: desc }) {
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
const getPublishedFlowByDate = async (id, created_at) => {
  const data = await client.request(
    `
      query GetPublishedFlowByDate($id: uuid!, $created_at: timestamptz!) {
        flows_by_pk(id: $id) {
          published_flows(
            limit: 1,
            order_by: { id: desc },
            where: { created_at: {_lte: $created_at} }
          ) {
            data
          }
        }
      }
    `,
    {
      id, created_at
    }
  );

  return data.flows_by_pk.published_flows?.[0]?.data;
}

// Flatten a flow's data to include main content & portals in a single JSON representation
// XXX: getFlowData & dataMerged are currently repeated in ../editor.planx.uk/src/lib/dataMergedHotfix.ts
//        in order to load frontend /preview routes for flows that are not published
const dataMerged = async (id, ob = {}) => {
  // get the primary flow data
  const { slug, data } = await getFlowData(id);

  // recursively get and flatten internal portals (type 300) & external portals (type 310)
  for (let [nodeId, node] of Object.entries(data)) {
    if (nodeId === "_root" && Object.keys(ob).length > 0) {
      ob[id] = {
        ...node,
        type: 300,
        data: { text: slug },
      };
    } else if (node.type === 310 && !ob[node.data.flowId]) {
      await dataMerged(node.data.flowId, ob);
      ob[nodeId] = {
        type: 300,
        edges: [node.data.flowId],
      };
    } else {
      ob[nodeId] = node;
    }
  }
  return ob;
};

module.exports = { getFlowData, getMostRecentPublishedFlow, getPublishedFlowByDate, dataMerged };
