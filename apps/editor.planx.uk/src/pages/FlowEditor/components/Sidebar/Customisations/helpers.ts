import type { OrderedFlow } from "@opensystemslab/planx-core/types";
import { ComponentType } from "@opensystemslab/planx-core/types";
import type { Store } from "pages/FlowEditor/lib/store";

import type { FlowEdits } from "./types";

/**
 * Checks if a customisable node has been updated
 */
export const hasNodeBeenUpdated = (
  nodeId: string,
  flow: Store.Flow,
  flowEdits: FlowEdits,
  orderedFlow?: OrderedFlow,
): boolean => {
  const node = flow[nodeId];
  const nodeEdits = flowEdits[nodeId];

  // This node has been directly edited
  if (nodeEdits) return true;

  const isNodeWithOptions =
    node.type &&
    [
      ComponentType.Question,
      ComponentType.Checklist,
      ComponentType.ResponsiveQuestion,
      ComponentType.ResponsiveChecklist,
      ComponentType.Filter,
    ].includes(node.type);

  // The direct "options" of this node have been edited
  if (isNodeWithOptions && node.edges) {
    const isOptionEdited = node.edges.some((edgeId) =>
      Boolean(flowEdits[edgeId]),
    );
    return isOptionEdited;
  }

  // This node is a folder and any of its children have been edited
  const isFolder = node.type === ComponentType.InternalPortal;
  if (isFolder) {
    const isChildOfFolderEdited = Object.entries(flowEdits).some(
      ([editedNodeId, _data]) =>
        orderedFlow?.find(({ id }) => id === editedNodeId)?.internalPortalId ===
        nodeId,
    );
    return isChildOfFolderEdited;
  }

  // Node has not been edited
  return false;
};
