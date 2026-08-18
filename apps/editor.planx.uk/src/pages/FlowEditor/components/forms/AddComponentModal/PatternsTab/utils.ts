import { ComponentType } from "@opensystemslab/planx-core/types";
import type { Graph } from "@planx/graph";

export interface PatternCounts {
  components: number;
  nestedFlows: number;
}

/**
 * Traverse graph to count components and nested flows
 * Traversal is required to properly account for clones
 */
export const getPatternCounts = (graph: Graph): PatternCounts => {
  let components = 0;
  let nestedFlows = 0;

  for (const node of Object.values(graph)) {
    for (const childId of node.edges ?? []) {
      const child = graph[childId];
      if (!child) continue;
      if (child.type === ComponentType.Answer) continue;

      if (child.type === ComponentType.ExternalPortal) {
        nestedFlows++;
      } else {
        components++;
      }
    }
  }

  return { components, nestedFlows };
};
