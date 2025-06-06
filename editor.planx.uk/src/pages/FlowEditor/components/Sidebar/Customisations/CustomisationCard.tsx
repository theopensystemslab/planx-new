import ListItem from "@mui/material/ListItem";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { ComponentType } from "@opensystemslab/planx-core/types";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useCallback } from "react";
import { NodeCard } from "ui/editor/NodeCard";

import { FlowEdits, NodeEdits } from "./types";

interface Props {
  nodeId: string;
  nodeEdits?: NodeEdits
  flowEdits: FlowEdits
};

export const CustomisationCard: React.FC<Props> = ({ nodeId, nodeEdits, flowEdits }) => {
  const [flow] = useStore((state) => [state.flow]);
  const node = flow[nodeId];

  const hasNodeBeenUpdated = useCallback(() => {
    // This node has been directly edited
    if (nodeEdits) return true;

    const isNodeWithChildren = node.type && [
      ComponentType.Question, 
      ComponentType.Checklist, 
      ComponentType.ResponsiveQuestion, 
      ComponentType.ResponsiveChecklist
    ].includes(node.type);

    // The "children" of this node have been updated
    if (isNodeWithChildren) {
      const isChildEdited = node.edges?.some((edgeId) => Boolean(flowEdits?.[edgeId]));
      return isChildEdited
    }

    // Node has not been edited
    return false;
  }, [nodeEdits, node, flowEdits]);

  const isComplete = hasNodeBeenUpdated();

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
            {JSON.stringify(nodeEdits, null, 2) || "Edges have been updated"}
          </Typography>
        )}
      </NodeCard>
    </ListItem>
  )
};