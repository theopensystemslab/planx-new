import StarIcon from "@mui/icons-material/Star";
import Typography from "@mui/material/Typography";
import { BaseNodeData } from "@planx/components/shared";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import ModalSection from "./ModalSection";
import ModalSectionContent from "./ModalSectionContent";

export const TemplatedNodeInstructions = ({
  isTemplatedNode,
  templatedNodeInstructions,
  areTemplatedNodeInstructionsRequired,
}: BaseNodeData) => {
  const isTemplatedFrom = useStore.getState().isTemplatedFrom;
  if (!isTemplatedFrom || !isTemplatedNode) return null;

  return (
    <ModalSection sectionBackgroundColor="#e6d6ff">
      <ModalSectionContent
        title={`Instructions ${areTemplatedNodeInstructionsRequired ? `(required)` : `(optional)`}`}
        Icon={StarIcon}
      >
        <Typography variant="body2">{templatedNodeInstructions}</Typography>
      </ModalSectionContent>
    </ModalSection>
  );
};
