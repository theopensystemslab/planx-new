import gql from "graphql-tag";

import { client } from "../lib/graphql";
import { TYPES } from "../planx-nodes/types";

const getFlowData = async (id) => {
  const { data } = await client.query({
    query: gql`
      query GetFlowData($id: uuid!) {
        flows_by_pk(id: $id) {
          data
        }
      }
    `,
    variables: {
      id,
    },
  });
  return data.flows_by_pk.data;
};

export const dataMerged = async (id, ob = {}) => {
  const data: Promise<Record<string, object>> = await getFlowData(id);
  for (let [nodeId, node] of Object.entries(data)) {
    if (nodeId === "_root" && Object.keys(ob).length > 0) {
      ob[id] = {
        ...node,
        type: TYPES.InternalPortal,
      };
    } else if (node.type === TYPES.ExternalPortal && !ob[node.data.flowId]) {
      await dataMerged(node.data.flowId, ob);
      ob[nodeId] = {
        type: TYPES.InternalPortal,
        edges: [node.data.flowId],
      };
    } else {
      ob[nodeId] = node;
    }
  }
  return ob;
};
