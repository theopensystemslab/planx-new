import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { NodeCard } from "ui/editor/NodeCard";

export const ReviewCard: React.FC<{ nodeId: string }> = ({ nodeId }) => {
  const node = useStore((state) => state.getNode(nodeId));
  const notes = node?.data?.notes;
  return (
    <ListItem>
      <NodeCard nodeId={nodeId} backgroundColor="#fff">
        {notes && (
          <Typography variant="body2">Internal notes - {notes}</Typography>
        )}
      </NodeCard>
    </ListItem>
  );
};
