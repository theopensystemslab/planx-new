import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";

import { Store } from "../../../lib/store";

export interface GroupedNode {
  node: Store.Node;
  notes: Store.Node[];
}

const isNoteNode = (node: Store.Node, flow: Store.Flow): boolean =>
  node.type === TYPES.Question &&
  node.id !== undefined &&
  (flow[node.id]?.edges ?? []).length === 0;

/**
 * Groups consecutive note nodes (Questions with no children) with the next
 * non-note sibling. Trailing notes with no following sibling are attached to
 * the last non-note node (if one exists).
 */
export const groupNotesWithNodes = (
  nodes: Store.Node[],
  flow: Store.Flow,
): GroupedNode[] => {
  const result: GroupedNode[] = [];
  let pendingNotes: Store.Node[] = [];

  for (const node of nodes) {
    if (isNoteNode(node, flow)) {
      pendingNotes.push(node);
    } else {
      result.push({ node, notes: pendingNotes });
      pendingNotes = [];
    }
  }

  if (pendingNotes.length > 0 && result.length > 0) {
    result[result.length - 1].notes.push(...pendingNotes);
  }

  return result;
};
