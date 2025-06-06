import ListItem from "@mui/material/ListItem";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";
import { NodeCard } from "ui/editor/NodeCard";

import { NodeEdits } from "./types";

interface Props {
  nodeId: string;
  nodeEdits?: NodeEdits
};

export const CustomisationCard: React.FC<Props> = ({ nodeId, nodeEdits }) => {
  const isComplete = Boolean(nodeEdits);
  const theme = useTheme();

  return (
    <ListItem key={nodeId} sx={{ pb: 2, pt: 0, px: 0 }}>
      <NodeCard 
        nodeId={nodeId} 
        backgroundColor={isComplete 
          ? theme.palette.background.paper
          : theme.palette.nodeTag.blocking
        }>
        {isComplete && (
          <Typography variant="body2" component="pre">
            {/** TODO decide whether to include details of _what_ was edited? Just logging data for now! */}
            {JSON.stringify(nodeEdits, null, 2)}
          </Typography>
        )}
      </NodeCard>
    </ListItem>
  )
};