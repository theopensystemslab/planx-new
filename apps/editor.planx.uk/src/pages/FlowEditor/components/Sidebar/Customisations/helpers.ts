import type { OrderedFlow } from "@opensystemslab/planx-core/types";
import { ComponentType } from "@opensystemslab/planx-core/types";
import type { Store } from "pages/FlowEditor/lib/store";

import type { FlowEdits } from "./types";

/**
 * Returns the ids of every folder containing an edited node, including folders nested within other folders
 */
export const getEditedFolderIds = (
  flowEdits: FlowEdits,
  orderedFlow?: OrderedFlow,
): Set<string> => {
  const editedFolderIds = new Set<string>();
  if (!orderedFlow) return editedFolderIds;

  const nodesById = new Map(orderedFlow.map((node) => [node.id, node]));

  for (const editedNodeId of Object.keys(flowEdits)) {
    // A folder's own internalPortalId is the folder it's nested within
    let folderId = nodesById.get(editedNodeId)?.internalPortalId;
    while (folderId && !editedFolderIds.has(folderId)) {
      editedFolderIds.add(folderId);
      folderId = nodesById.get(folderId)?.internalPortalId;
    }
  }

  return editedFolderIds;
};

/**
 * Checks if a customisable node has been updated
 */
export const hasNodeBeenUpdated = (
  nodeId: string,
  flow: Store.Flow,
  flowEdits: FlowEdits,
  editedFolderIds: Set<string>,
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
  if (isFolder) return editedFolderIds.has(nodeId);

  // Node has not been edited
  return false;
};
