import StarIcon from "@mui/icons-material/Star";
import { useTheme } from "@mui/material/styles";
import { BaseNodeData } from "@planx/components/shared";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import BlockQuote from "ui/editor/BlockQuote";

import ModalSection from "./ModalSection";
import ModalSectionContent from "./ModalSectionContent";

export const TemplatedNodeInstructions = ({
  isTemplatedNode,
  templatedNodeInstructions,
  areTemplatedNodeInstructionsRequired,
}: BaseNodeData) => {
  const theme = useTheme();

  const isTemplatedFrom = useStore.getState().isTemplatedFrom;
  if (!isTemplatedFrom || !isTemplatedNode) return null;

  return (
    <ModalSection sectionBackgroundColor={theme.palette.template.main}>
      <ModalSectionContent
        title={`Customise ${areTemplatedNodeInstructionsRequired ? `(required)` : `(optional)`}`}
        Icon={StarIcon}
      >
        <BlockQuote>{templatedNodeInstructions}</BlockQuote>
      </ModalSectionContent>
    </ModalSection>
  );
};
