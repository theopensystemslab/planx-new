import Box from "@mui/material/Box";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

export const AttachedNote: React.FC<{
  note: string;
  variant?: "option";
}> = ({ note, variant }) => {
  const showNotes = useStore((state) => state.showNotes);

  // TODO also return null if templated flow and *not* attached to a templated node?
  if (!showNotes) return null;

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
