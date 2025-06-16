import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import { styled, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { ComponentType } from "@opensystemslab/planx-core/types";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useCallback } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { NodeCard } from "ui/editor/NodeCard";

import { FlowEdits, NodeEdits } from "./types";

interface Props {
  nodeId: string;
  nodeEdits?: NodeEdits;
  flowEdits: FlowEdits;
}

const CardContainer = styled(Box)<{ isComplete: boolean }>(
  ({ theme, isComplete }) => ({
    backgroundColor: isComplete
      ? theme.palette.common.white
      : theme.palette.template.dark,
    border: "1px solid",
    borderColor: isComplete ? theme.palette.border.main : "transparent",
    width: "100%",
    padding: theme.spacing(0.25, 0.25, 0.25),
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  }),
);

const StatusHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(0.5),
  width: "100%",
  padding: theme.spacing(0.5),
}));

export const CustomisationCard: React.FC<Props> = ({
  nodeId,
  nodeEdits,
  flowEdits,
}) => {
  const [flow] = useStore((state) => [state.flow]);
  const node = flow[nodeId];

  const hasNodeBeenUpdated = useCallback(() => {
    // This node has been directly edited
    if (nodeEdits) return true;

    const isNodeWithChildren =
      node.type &&
      [
        ComponentType.Question,
        ComponentType.Checklist,
        ComponentType.ResponsiveQuestion,
        ComponentType.ResponsiveChecklist,
      ].includes(node.type);

    // The "children" of this node have been updated
    if (isNodeWithChildren) {
      const isChildEdited = node.edges?.some((edgeId) =>
        Boolean(flowEdits?.[edgeId]),
      );
      return isChildEdited;
    }

    // Node has not been edited
    return false;
  }, [nodeEdits, node, flowEdits]);

  const theme = useTheme();

  const isComplete = Boolean(hasNodeBeenUpdated());

  const getTemplatedNodeStatus = (
    isComplete: boolean,
    areTemplatedNodeInstructionsRequired?: boolean,
  ) => {
    if (isComplete) return "Done";
    if (areTemplatedNodeInstructionsRequired) return "Required";
    return "Optional";
  };

  return (
    <ListItem
      key={nodeId}
      sx={{
        pb: 1,
        pt: 0,
        px: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        width: "100%",
      }}
    >
      <CardContainer isComplete={isComplete}>
        <StatusHeader>
          {isComplete && <CheckCircleIcon color="success" fontSize="small" />}
          <Typography
            variant="body3"
            sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
          >
            {getTemplatedNodeStatus(
              isComplete,
              node.data?.areTemplatedNodeInstructionsRequired,
            )}
          </Typography>
        </StatusHeader>
        <NodeCard nodeId={nodeId} backgroundColor={theme.palette.common.white}>
          <Typography variant="body2">
            {node.data?.templatedNodeInstructions}
          </Typography>
        </NodeCard>
      </CardContainer>
    </ListItem>
  );
};
