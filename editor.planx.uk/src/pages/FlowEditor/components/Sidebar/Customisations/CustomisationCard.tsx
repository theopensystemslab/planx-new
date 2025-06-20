import ListItem from "@mui/material/ListItem";
import { useTheme } from "@mui/material/styles";
import { ComponentType } from "@opensystemslab/planx-core/types";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useCallback } from "react";
import BlockQuote from "ui/editor/BlockQuote";
import { NodeCard } from "ui/editor/NodeCard";
import { TemplatedNodeContainer } from "ui/editor/TemplatedNodeContainer";

import { FlowEdits, NodeEdits } from "./types";

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
