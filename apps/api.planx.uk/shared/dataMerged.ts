import type { FlowGraph } from "@opensystemslab/planx-core/types";
import { ComponentType } from "@opensystemslab/planx-core/types";

import { getFlowData, getMostRecentPublishedFlowVersion } from "../helpers.js";
import type { Flow, Node } from "../types.js";

/**
 * Flatten a flow to create a single JSON representation of the main flow data and any external portals
 *   By default, requires that any external portals are published and flattens their latest published version
 *   When draftDataOnly = true, flattens the draft data of the main flow and the draft data of any external portals published or otherwise
 */
export const dataMerged = async (
  id: string,
  ob: { [key: string]: Node } = {},
  isPortal = false,
  draftDataOnly = false,
): Promise<FlowGraph> => {
  // get the primary draft flow data, including its' latest published version
  const response = await getFlowData(id);
  const { slug, team, publishedFlows } = response;
  let { data } = response;

  // only flatten external portals that are published, unless we're loading draftDataOnly
  if (isPortal && !draftDataOnly) {
    if (publishedFlows?.[0]?.data) {
      data = publishedFlows[0].data;
    } else {
      throw new Error(
        `Publish flow ${team.slug}/${slug} before proceeding. All flows used as external portals must be published.`,
      );
    }
  }

  // recursively get and flatten external portals
  for (const [nodeId, node] of Object.entries(data)) {
    const isExternalPortalRoot =
      nodeId === "_root" && Object.keys(ob).length > 0;
    const isExternalPortal = node.type === ComponentType.ExternalPortal;
    const isMerged = ob[node.data?.flowId];

    // merge external portal _root node as a new node in the graph using its' flowId as nodeId
    if (isExternalPortalRoot) {
      ob[id] = {
        ...node, // includes _root edges for navigation to all child nodes in this portal
        type: ComponentType.InternalPortal,
        data: {
          text: `${team.slug}/${slug}`,
          flattenedFromExternalPortal: true,
          templatedFrom: response.templatedFrom,
          // add extra metadata about latest published version when applicable
          ...(!draftDataOnly && {
            publishedFlowId: publishedFlows?.[0]?.id,
            publishedAt: publishedFlows?.[0]?.created_at,
            publishedBy: publishedFlows?.[0]?.publisher_id,
            summary: publishedFlows?.[0]?.summary,
          }),
        },
      };
    }

    // merge external portal type node as an internal portal type node, with an edge pointing to flowId (to navigate to the externalPortalRoot set above)
    else if (isExternalPortal) {
      ob[nodeId] = {
        type: ComponentType.InternalPortal,
        edges: [node.data?.flowId],
        data: {
          flattenedFromExternalPortal: true,
        },
      };

      // recursively merge flow
      if (!isMerged) {
        await dataMerged(node.data?.flowId, ob, true, draftDataOnly);
      }
    }

    // merge all other nodes
    else ob[nodeId] = node;
  }

  // for every external portal that has been merged, confirm its' latest version was merged. If not, overwrite older snapshot with newest version
  //   ** this is a final/separate step because older snapshots can be nested in _already_ flattened data (eg not picked up as ComponentType.ExternalPortal above)
  if (!draftDataOnly) {
    for (const [nodeId, node] of Object.entries(ob).filter(
      ([_nodeId, node]) => node.data?.publishedFlowId,
    )) {
      const mostRecentPublishedFlowId =
        await getMostRecentPublishedFlowVersion(nodeId);
      if (mostRecentPublishedFlowId !== node.data?.publishedFlowId) {
        await dataMerged(nodeId, ob, true, draftDataOnly);
      }
    }
  }

  return ob as FlowGraph;
};
