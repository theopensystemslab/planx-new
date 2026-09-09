import Box from "@mui/material/Box";
import { useStore } from "pages/FlowEditor/lib/store";
import { showNoteInTemplatedFlow } from "pages/FlowEditor/lib/store/utils/showNoteInTemplatedFlow";
import React from "react";

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
  const showAttachedNote =
    showNotes &&
    (!isTemplatedFrom || showNoteInTemplatedFlow(nodeId, flow, orderedFlow));

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
