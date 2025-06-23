import Container from "@mui/material/Container";
import { hasFeatureFlag } from "lib/featureFlags";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import { FooterLinksAndLegalDisclaimer } from "./FlowElements/FooterLinksAndLegalDisclaimer";
import FlowStatus from "./FlowStatus";
import { FlowVisibility } from "./FlowVisibility/FlowVisibilitySection";
import { TemplatedFlowStatus } from "./TemplatedFlowStatus/TemplatedFlowStatusSection";

const ServiceSettings: React.FC = () => {
  const [isTemplatedFrom, isTemplate] = useStore((state) => [
    state.isTemplatedFrom,
    state.isTemplate,
  ]);

  return (
    <Container
      maxWidth="formWrap"
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <FlowStatus />
      {!isTemplatedFrom && !isTemplate && <FlowVisibility />}
      <FooterLinksAndLegalDisclaimer />
      {hasFeatureFlag("TEMPLATES") && isTemplatedFrom && (
        <TemplatedFlowStatus />
      )}
    </Container>
  );
};

export default ServiceSettings;
