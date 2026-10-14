import { getParentId } from "pages/FlowEditor/components/Flow/lib/utils";
import {
  nodeIsChildOfTemplatedInternalPortal,
  nodeIsTemplatedInternalPortal,
} from "pages/FlowEditor/utils";

import type { Store } from "..";
import { getIndexedFlow } from "./indexedFlow";

// In templated flows, always hide `Note` components and attached `notes` props in the graph
//   unless either is attached to a templated node or within a templated folder
export const showNoteInTemplatedFlow = (
  nodeId: string | undefined,
  flow: Store.Flow,
) => {
  if (!nodeId || !flow[nodeId]) return false;

  const isAttachedToTemplatedNode = flow[nodeId]?.data?.isTemplatedNode;
  const parent = getParentId(nodeId);
  const indexedParent = getIndexedFlow(flow).nodes[parent];
  const parentIsTemplatedInternalPortal = nodeIsTemplatedInternalPortal(
    flow,
    indexedParent,
  );
  const parentIsChildOfTemplatedInternalPortal =
    nodeIsChildOfTemplatedInternalPortal(flow, indexedParent);

  return (
    isAttachedToTemplatedNode ||
    parentIsTemplatedInternalPortal ||
    parentIsChildOfTemplatedInternalPortal
  );
};
