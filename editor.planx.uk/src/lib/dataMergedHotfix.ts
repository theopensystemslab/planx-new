import { TYPES } from "@planx/components/types";
import gql from "graphql-tag";

import { publicClient } from "../lib/graphql";

const getFlowData = async (id: string) => {
  const { data } = await publicClient.query({
    query: gql`
      query GetFlowData($id: uuid!) {
        flows_by_pk(id: $id) {
          slug
          data
        }
      }
    `,
    variables: {
      id,
    },
  });
  return data.flows_by_pk;
};

export const dataMerged = async (
  id: string,
  ob: Record<string, any> = {},
): Promise<Record<string, any>> => {
  const { slug, data }: { slug: string; data: Record<string, any> } =
    await getFlowData(id);
  for (const [nodeId, node] of Object.entries(data)) {
    if (nodeId === "_root" && Object.keys(ob).length > 0) {
      ob[id] = {
        ...node,
        type: TYPES.InternalPortal,
        data: { text: slug },
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
