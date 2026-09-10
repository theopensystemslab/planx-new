import type { OrderedFlow } from "@opensystemslab/planx-core/types";
import { getParentId } from "pages/FlowEditor/components/Flow/lib/utils";
import {
  nodeIsChildOfTemplatedInternalPortal,
  nodeIsTemplatedInternalPortal,
} from "pages/FlowEditor/utils";

import type { Store } from "..";

// In templated flows, always hide `Note` components and attached `notes` props in the graph
//   unless either is attached to a templated node or within a templated folder
export const showNoteInTemplatedFlow = (
  nodeId: string | undefined,
  flow: Store.Flow,
  orderedFlow: OrderedFlow | undefined,
) => {
  if (!nodeId || !flow[nodeId]) return false;

  const isAttachedToTemplatedNode = flow[nodeId]?.data?.isTemplatedNode;
  const parent = getParentId(nodeId);
  const indexedParent = orderedFlow?.find(({ id }) => id === parent);
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
