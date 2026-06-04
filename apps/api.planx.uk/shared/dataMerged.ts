import type { FlowGraph } from "@opensystemslab/planx-core/types";
import { ComponentType } from "@opensystemslab/planx-core/types";

import { getFlowData, getMostRecentPublishedFlowVersion } from "../helpers.js";
import type { Node } from "../types.js";

type Stack = Array<{ flowId: string; isPortal: boolean }>;
type MergedGraph = { [key: string]: Node }; // *not* `FlowGraph` because we can't guarantee `_root` node while merge-in-progress

/**
 * Flatten flows to create a single JSON representation of the main flow data and any external portals
 *   By default, requires that any external portals are published and flattens their latest published version
 *   When draftDataOnly = true, flattens the draft data of the main flow and the draft data of any external portals published or otherwise
 */
export const dataMerged = async (
  flowId: string,
  isPortal = false,
  draftDataOnly = false,
): Promise<FlowGraph> => {
  const stack: Stack = [{ flowId, isPortal }];
  const mergedFlowIds = new Set<string>();

  let mergedGraph: MergedGraph = {};
  mergedGraph = await fetchAndMergeStack(
    mergedGraph,
    draftDataOnly,
    stack,
    mergedFlowIds,
  );

  // For every external portal that has been merged, confirm its' latest version was merged
  //   If not, overwrite stale snapshot with newest version
  //   ** This requires a second/separate stack loop because stale snapshots can be nested in _already_ flattened data (eg not picked up as ComponentType.ExternalPortal above)
  if (!draftDataOnly) {
    for (const [nodeId, node] of Object.entries(mergedGraph).filter(
      ([_nodeId, node]) => node.data?.publishedFlowId,
    )) {
      const mostRecentPublishedFlowId =
        await getMostRecentPublishedFlowVersion(nodeId);
      if (mostRecentPublishedFlowId !== node.data?.publishedFlowId) {
        const staleStack: Stack = [{ flowId: nodeId, isPortal: true }];
        const staleMergedFlowIds = new Set<string>();

        mergedGraph = await fetchAndMergeStack(
          mergedGraph,
          draftDataOnly,
          staleStack,
          staleMergedFlowIds,
        );
      }
    }
  }

  return mergedGraph as FlowGraph;
};

const fetchAndMergeStack = async (
  mergedGraph: MergedGraph = {},
  draftDataOnly = false,
  stack: Stack,
  mergedFlowIds: Set<string>,
): Promise<MergedGraph> => {
  while (stack.length > 0) {
    // Traverse portals depth-first by using `pop`
    const { flowId, isPortal: currentFlowIdIsPortal } = stack.pop()!;

    // Prevent re-fetching flows we've already merged
    if (mergedFlowIds.has(flowId)) continue;
    mergedFlowIds.add(flowId);

    // Fetch draft flow data, including its' latest published version
    const response = await getFlowData(flowId);
    const { slug, team, publishedFlows } = response;
    let { data } = response;

    // Only flatten external portals that are published, unless we're merging draftDataOnly
    if (currentFlowIdIsPortal && !draftDataOnly) {
      if (publishedFlows?.[0]?.data) {
        data = publishedFlows[0].data;
      } else {
        throw new Error(
          `Publish flow ${team.slug}/${slug} before proceeding. All nested flows must be published.`,
        );
      }
    }

    // Fetch portals/nested flows
    for (const [nodeId, node] of Object.entries(data)) {
      const isExternalPortalRoot =
        nodeId === "_root" && Object.keys(mergedGraph).length > 0;
      const isExternalPortal = node.type === ComponentType.ExternalPortal;
      const isMerged = mergedGraph[node.data?.flowId];

      if (isExternalPortalRoot) {
        // Merge external portal's `_root` node as a new internal node type in the graph using its' flowId as nodeId
        mergedGraph[flowId] = {
          ...node, // includes `edges` in order to navigate to all child nodes
          type: ComponentType.InternalPortal,
          data: {
            text: `${team.slug}/${slug}`,
            flattenedFromExternalPortal: true,
            templatedFrom: response.templatedFrom,
            // Add extra metadata about latest published version when applicable
            ...(!draftDataOnly && {
              publishedFlowId: publishedFlows?.[0]?.id,
              publishedAt: publishedFlows?.[0]?.createdAt,
              publishedBy: publishedFlows?.[0]?.publisherId,
              summary: publishedFlows?.[0]?.summary,
            }),
          },
        };
      } else if (isExternalPortal) {
        // Merge external portal type node as an internal portal type node, with a single edge pointing to flowId (to navigate to the externalPortalRoot set above)
        mergedGraph[nodeId] = {
          type: ComponentType.InternalPortal,
          edges: [node.data?.flowId],
          data: {
            flattenedFromExternalPortal: true,
            // Persist templated node fields for publish validation checks
            isTemplatedNode: node.data?.isTemplatedNode,
            areTemplatedNodeInstructionsRequired:
              node.data?.areTemplatedNodeInstructionsRequired,
          },
        };

        // Push to stack
        if (!isMerged) {
          stack.push({ flowId: node.data?.flowId, isPortal: true });
        }
      } else {
        // Merge all non-portal nodes
        mergedGraph[nodeId] = node;
      }
    }
  }

  return mergedGraph;
};
