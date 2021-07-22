const { GraphQLClient } = require("graphql-request");
const jsondiffpatch = require("jsondiffpatch");

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

  return (
    data.flows_by_pk.published_flows[0] &&
    data.flows_by_pk.published_flows[0].data
  );
};

// XXX: getFlowData & dataMerged are currently repeated in ../editor.planx.uk/src/lib/dataMergedHotfix.ts
// in order to load previews for flows that have not been published yet
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

const publishFlow = async (req, res) => {
  if (!req.user?.sub)
    return res.status(401).json({ error: "User ID missing from JWT" });

  const flattenedFlow = await dataMerged(req.params.flowId);

  const pub = await getMostRecentPublishedFlow(req.params.flowId);

  const delta = jsondiffpatch.diff(pub, flattenedFlow);

  // return published flow record if changes were made
  const response = delta
    ? await client.request(
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
          flow_id
          publisher_id
          created_at
          data
        }
      }`,
        {
          data: flattenedFlow,
          flow_id: req.params.flowId,
          publisher_id: parseInt(req.user.sub, 10),
        }
      )
    : "No new changes";

  try {
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

module.exports = { publishFlow };
