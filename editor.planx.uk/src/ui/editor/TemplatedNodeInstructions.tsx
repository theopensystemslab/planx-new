import StarIcon from "@mui/icons-material/Star";
import Typography from "@mui/material/Typography";
import { BaseNodeData } from "@planx/components/shared";
import { WarningContainer } from "@planx/components/shared/Preview/WarningContainer";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import ModalSection from "./ModalSection";

export const TemplatedNodeInstructions = ({
  isTemplatedNode,
  templatedNodeInstructions,
  areTemplatedNodeInstructionsRequired,
}: BaseNodeData) => {
  const isTemplatedFrom = useStore.getState().isTemplatedFrom;
  if (!isTemplatedFrom && !isTemplatedNode) return null;

  return (
    <ModalSection>
      <WarningContainer>
        <StarIcon />
        <Typography variant="body2" ml={2}>
          {templatedNodeInstructions}
          {areTemplatedNodeInstructionsRequired ? `*` : ``}
        </Typography>
      </WarningContainer>
    </ModalSection>
  );
};
