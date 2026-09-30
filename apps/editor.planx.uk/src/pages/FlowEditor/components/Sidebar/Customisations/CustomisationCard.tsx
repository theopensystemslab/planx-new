import ListItem from "@mui/material/ListItem";
import { useTheme } from "@mui/material/styles";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useCallback } from "react";
import BlockQuote from "ui/editor/BlockQuote";
import { NodeCard } from "ui/editor/NodeCard";
import { TemplatedNodeContainer } from "ui/editor/TemplatedNodeContainer";

import { hasNodeBeenUpdated } from "./helpers";
import type { FlowEdits, NodeEdits } from "./types";

interface Props {
  nodeId: string;
  nodeEdits?: NodeEdits;
  flowEdits: FlowEdits;
}

export const CustomisationCard: React.FC<Props> = ({
  nodeId,
  nodeEdits,
  flowEdits,
}) => {
  const [flow, orderedFlow] = useStore((state) => [
    state.flow,
    state.orderedFlow,
  ]);
  const node = flow[nodeId];

  // Keep this logic in sync with `haveAllRequiredTemplatedNodesBeenUpdated` in the API flows/validate module !
  const hasNodeBeenUpdatedCallback = useCallback(() => {
    return hasNodeBeenUpdated(nodeId, flow, flowEdits, orderedFlow);
  }, [nodeEdits, node, flowEdits, nodeId, flow, orderedFlow]);

  const theme = useTheme();

  const isComplete = Boolean(hasNodeBeenUpdatedCallback());

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
      <TemplatedNodeContainer
        isTemplatedNode={Boolean(node.data?.isTemplatedNode)}
        areTemplatedNodeInstructionsRequired={Boolean(
          node.data?.areTemplatedNodeInstructionsRequired,
        )}
        isComplete={isComplete}
        showStatus={true}
      >
        <NodeCard nodeId={nodeId} backgroundColor={theme.palette.common.white}>
          <BlockQuote>{node.data?.templatedNodeInstructions}</BlockQuote>
        </NodeCard>
      </TemplatedNodeContainer>
    </ListItem>
  );
};
