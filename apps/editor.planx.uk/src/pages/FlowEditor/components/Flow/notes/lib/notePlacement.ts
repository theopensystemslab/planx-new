import type { Graph } from "@planx/graph";
import { ROOT_NODE_KEY } from "@planx/graph";
import type { NotePlacement } from "hooks/data/useFlowNotes";

/**
 * Find the id of the node whose `edges` contains `nodeId`
 */
export const findContainerOf = (
  flow: Graph,
  nodeId: string,
): string | undefined => {
  for (const [id, node] of Object.entries(flow)) {
    if (node.edges?.includes(nodeId)) {
      return id;
    }
  }
  return undefined;
};

/**
 * Given a graph gap `{container, before?}` (i.e. Hanger co-ordinate), returns a `NotePlacement` to store
 */
export const resolveNotePlacement = (
  flow: Graph,
  container: string,
  before?: string,
): NotePlacement => {
  const containerEdges = flow[container]?.edges ?? [];
  const precedingId = before
    ? containerEdges[containerEdges.indexOf(before) - 1]
    : containerEdges[containerEdges.length - 1];

  if (precedingId) {
    return { parent: precedingId };
  }

  return { parent: container, before };
};

/**
 * Reverses `resolveNotePlacement` - given a stored placement, finds the graph gap `{container, before?}` to render it
 */
export const resolveNoteRenderCoordinate = (
  flow: Graph,
  placement: NotePlacement,
): { container: string; before?: string } => {
  if (placement.parent === ROOT_NODE_KEY || placement.before !== undefined) {
    return { container: placement.parent, before: placement.before };
  }

  const container = findContainerOf(flow, placement.parent);
  if (!container) {
    return { container: placement.parent, before: undefined };
  }

  const siblings = flow[container]?.edges ?? [];
  const index = siblings.indexOf(placement.parent);
  return { container, before: siblings[index + 1] };
};
