import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import React from "react";
import { NodeCard } from "ui/editor/NodeCard";

export const ReviewCard: React.FC<{ nodeId: string; notes?: string }> = ({
  nodeId,
  notes,
}) => (
  <ListItem>
    <NodeCard nodeId={nodeId} backgroundColor="#fff">
      {notes && (
        <Typography variant="body2">Internal notes - {notes}</Typography>
      )}
    </NodeCard>
  </ListItem>
);
