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

  return { parent: container, before, parentIsContainer: true };
};

/**
 * Reverses `resolveNotePlacement` - given a stored placement, finds the graph gap `{container, before?}` to render it
 */
export const resolveNoteRenderCoordinate = (
  flow: Graph,
  placement: NotePlacement,
): { container: string; before?: string } => {
  if (
    placement.parentIsContainer ||
    placement.parent === ROOT_NODE_KEY ||
    placement.before !== undefined
  ) {
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

/**
 * Given a set of just-deleted node ids, re-position a note's placement if it was a child (via `placement.parent`) of one of them.
 *
 * Walks back through the flow as it was before the deletion to find the nearest surviving sibling and re-positions there.
 *
 * Skips nodes that were deleted in the same operation.
 *
 * Falls back to the container if nothing precedes the deleted node.
 *
 * Returns `null` if the container itself was also deleted, in which case there's no valid position left.
 */
export const repositionPlacementAfterDeletion = (
  flowBeforeDelete: Graph,
  flowAfterDelete: Graph,
  deletedAnchorId: string,
  deletedIds: Set<string>,
): NotePlacement | null => {
  const container = findContainerOf(flowBeforeDelete, deletedAnchorId);
  if (!container || deletedIds.has(container)) return null;

  const oldSiblings = flowBeforeDelete[container]?.edges ?? [];
  let index = oldSiblings.indexOf(deletedAnchorId) - 1;

  while (index >= 0 && deletedIds.has(oldSiblings[index])) index -= 1;

  if (index >= 0) return { parent: oldSiblings[index] };

  return {
    parent: container,
    before: flowAfterDelete[container]?.edges?.[0],
    parentIsContainer: true,
  };
};
