import { ComponentType } from "@opensystemslab/planx-core/types";
import type { Graph } from "@planx/graph";

/** Answers are part of their parent component, and Notes are editor-only annotations */
const isCountedComponent = (type?: number): boolean =>
  type !== ComponentType.Answer && type !== ComponentType.Note;

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
      if (!isCountedComponent(child.type)) continue;

      if (child.type === ComponentType.ExternalPortal) {
        nestedFlows++;
      } else {
        components++;
      }
    }
  }

  return { components, nestedFlows };
};

/**
 * Depth-first traversal from the root, returning the types of the first
 * components in flow order (excluding Answers, which are traversed through, and Notes)
 */
export const getPatternComponentTypes = (
  graph: Graph,
  limit: number,
): ComponentType[] => {
  const types: ComponentType[] = [];

  const visit = (nodeId: string): void => {
    if (types.length >= limit) return;
    const node = graph[nodeId];
    if (!node) return;

    if (node.type && isCountedComponent(node.type)) {
      types.push(node.type as ComponentType);
    }

    for (const childId of node.edges ?? []) visit(childId);
  };

  for (const childId of graph._root?.edges ?? []) visit(childId);

  return types;
};
