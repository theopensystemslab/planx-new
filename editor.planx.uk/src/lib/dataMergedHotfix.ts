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

// Flatten a flow's data to include main content & portals in a single JSON representation
// XXX: getFlowData & dataMerged are currently repeated in api.planx.uk/helpers.ts
//        in order to load frontend /preview routes for flows that are not published
export const dataMerged = async (id: string, ob: Record<string, any> = {}) => {
  // get the primary flow data
  const { slug, data }: { slug: string; data: Record<string, any> } = await getFlowData(id);

  // recursively get and flatten internal portals & external portals
  for (const [nodeId, node] of Object.entries(data)) {
    const isExternalPortalRoot = nodeId === "_root" && Object.keys(ob).length > 0;
    const isExternalPortal = node.type === TYPES.ExternalPortal;
    const isMerged = ob[node.data?.flowId];

    // Merge portal root as a new node in the graph
    if (isExternalPortalRoot) {
      ob[id] = {
        ...node,
        type: TYPES.InternalPortal,
        data: { text: slug },
      };
    }

    // Merge as internal portal, with reference to flowId
    else if (isExternalPortal) {
      ob[nodeId] = {
        type: TYPES.InternalPortal,
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

  return ob;
};
