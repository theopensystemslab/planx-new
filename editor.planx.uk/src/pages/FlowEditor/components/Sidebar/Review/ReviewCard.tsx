import ListItem from "@mui/material/ListItem";
import React from "react";
import { NodeCard } from "ui/editor/NodeCard";

export const ReviewCard: React.FC<{ nodeId: string }> = ({ nodeId }) => (
  <ListItem sx={{ pb: 1, pt: 0, px: 0 }}>
    <NodeCard nodeId={nodeId} backgroundColor="#fff" />
  </ListItem>
);
