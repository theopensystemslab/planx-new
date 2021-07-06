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

const publishFlow = () => async (req, res) => {
  const flattenedFlow = await dataMerged(req.params.flowId);

  const publishedFlow = await client.request(
    `
      mutation PublishFlow(
        $data: jsonb = {},
        $flow_id: uuid,
        $publisher_id: Int,
      ) {
        insert_published_flows_one(object: {
          data: $data,
          flow_id: $flow_id,
          publisher_id: $publisher_id,
        }) {
          id
        }
      }`,
    {
      data: flattenedFlow,
      flow_id: req.params.flowId,
      publisher_id: 4, // TODO set dynamically
    }
  );

  try {
    // return id of published flow
    res.json(publishedFlow.insert_published_flows_one);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

module.exports = { publishFlow };
