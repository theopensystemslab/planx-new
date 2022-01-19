const { GraphQLClient } = require("graphql-request");

const client = new GraphQLClient(process.env.HASURA_GRAPHQL_URL, {
  headers: {
    "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET,
  },
});

const getFlowData = async (id) => {
  const data = await client.request(
    `
      query GetFlowData($id: uuid!) {
        flows_by_pk(id: $id) {
          data
        }
      }
      `,
    { id }
  );

  return data.flows_by_pk.data;
};

// XXX: getFlowData & dataMerged are currently repeated in ../editor.planx.uk/src/lib/dataMergedHotfix.ts
//        in order to load previews for flows that are not published
const dataMerged = async (id, ob = {}) => {
  // get the primary flow data
  const data = await getFlowData(id);

  // recursively get and flatten internal portals (type 300) & external portals (type 310)
  for (let [nodeId, node] of Object.entries(data)) {
    if (nodeId === "_root" && Object.keys(ob).length > 0) {
      ob[id] = {
        ...node,
        type: 300,
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

module.exports = { dataMerged };
