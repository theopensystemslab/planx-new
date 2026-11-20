import type { FlowGraph } from "@opensystemslab/planx-core/types";
import { ComponentType } from "@opensystemslab/planx-core/types";
import cloneDeep from "lodash/cloneDeep.js";

import type { MergedGraph } from "./dataMerged.js";

/**
 * Unflattens a flattened flow back to the shape of its' main flow (inverse of `dataMerged`)
 *   - Folders created from nested flows (`flattenedFromExternalPortal`) are restored as `ComponentType.ExternalPortal` nodes
 *   - Nested flow content (each nested flows `_root` node and its descendants) are removed, keeping only the "main" flow
 *
 * Note that the following cannot be recovered from flattened data:
 *   - Sanitised Note components and internal notes
 *   - Any main flow nodes which were overwritten during merge by a nested flow node with a colliding id
 */
export const dataUnmerged = (flattenedFlow: FlowGraph): FlowGraph => {
  const graph = flattenedFlow as MergedGraph;
  const unmergedGraph: MergedGraph = {};

  // Traverse from the main flow's `_root`, stopping at flattened external portals
  //   This ensures we only keep nodes belonging to the main flow, and never descend into nested flow content
  const stack: string[] = ["_root"];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const nodeId = stack.pop()!;
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    const node = graph[nodeId];
    if (!node) continue;

    const isFlattenedExternalPortal =
      node.type === ComponentType.InternalPortal &&
      node.data?.flattenedFromExternalPortal;

    if (isFlattenedExternalPortal) {
      // Same as when flattening, persist templated node fields for publish validation checks
      const { isTemplatedNode, areTemplatedNodeInstructionsRequired } =
        node.data ?? {};

      unmergedGraph[nodeId] = {
        type: ComponentType.ExternalPortal,
        data: {
          flowId: node.edges?.[0],
          ...(isTemplatedNode !== undefined && { isTemplatedNode }),
          ...(areTemplatedNodeInstructionsRequired !== undefined && {
            areTemplatedNodeInstructionsRequired,
          }),
        },
      };
      continue;
    }

    unmergedGraph[nodeId] = cloneDeep(node);
    if (node.edges) stack.push(...node.edges);
  }

  return unmergedGraph as FlowGraph;
};
