import Box from "@mui/material/Box";
import { useStore } from "pages/FlowEditor/lib/store";
import {
  nodeIsChildOfTemplatedInternalPortal,
  nodeIsTemplatedInternalPortal,
} from "pages/FlowEditor/utils";

import { getParentId } from "../lib/utils";

export const AttachedNote: React.FC<{
  nodeId: string;
  note: string;
  variant?: "option";
}> = ({ nodeId, note, variant }) => {
  const [showNotes, isTemplatedFrom, flow, orderedFlow] = useStore((state) => [
    state.showNotes,
    state.isTemplatedFrom,
    state.flow,
    state.orderedFlow,
  ]);

  // In templated flows, always hide `AttachedNote` in the graph
  //   unless it is attached to a templated node or within a templated folder
  const isAttachedToTemplatedNode = flow[nodeId]?.data?.isTemplatedNode;
  const parent = getParentId(nodeId);
  const indexedParent = orderedFlow?.find(({ id }) => id === parent);
  const parentIsTemplatedInternalPortal = nodeIsTemplatedInternalPortal(
    flow,
    indexedParent,
  );
  const parentIsChildOfTemplatedInternalPortal =
    nodeIsChildOfTemplatedInternalPortal(flow, indexedParent);

  const showAttachedNote =
    showNotes &&
    (!isTemplatedFrom ||
      isAttachedToTemplatedNode ||
      parentIsTemplatedInternalPortal ||
      parentIsChildOfTemplatedInternalPortal);

  if (!showAttachedNote) return null;

  return (
    <Box
      className="card-attached-note"
      sx={() => ({
        borderWidth: variant === "option" ? "1px 0 0 0" : "0 1px 1px 1px",
        borderStyle: "solid",
        width: "100%",
        p: 0.5,
        textAlign: "left",
      })}
    >
      {note}
    </Box>
  );
};
