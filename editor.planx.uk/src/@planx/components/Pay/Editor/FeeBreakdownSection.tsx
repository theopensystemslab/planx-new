import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { hasFeatureFlag } from "lib/featureFlags";
import React from "react";
import { FeaturePlaceholder } from "ui/editor/FeaturePlaceholder";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";

export const FeeBreakdownSection: React.FC = () => {
  if (!hasFeatureFlag("FEE_BREAKDOWN")) return null;

  return (
    <ModalSection>
      <ModalSectionContent title="Fee breakdown" Icon={ReceiptLongIcon}>
      <FeaturePlaceholder title="TODO: Fee breakdown explanation"/>
      </ModalSectionContent>
    </ModalSection>
  );
};
