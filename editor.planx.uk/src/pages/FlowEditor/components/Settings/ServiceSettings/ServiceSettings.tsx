import Container from "@mui/material/Container";
import { hasFeatureFlag } from "lib/featureFlags";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import { FooterLinksAndLegalDisclaimer } from "./FlowElements/FooterLinksAndLegalDisclaimer";
import FlowStatus from "./FlowStatus";
import { FlowVisibility } from "./FlowVisibility/FlowVisibilitySection";
import { TemplatedFlowStatus } from "./TemplatedFlowStatus/TemplatedFlowStatusSection";

const ServiceSettings: React.FC = () => {
  const isTemplatedFrom = useStore().isTemplatedFrom;

  return (
    <Container
      maxWidth="formWrap"
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <FlowStatus />
      {hasFeatureFlag("TEMPLATES") && isTemplatedFrom && (
        <TemplatedFlowStatus />
      )}
      <FlowVisibility />
      <FooterLinksAndLegalDisclaimer />
    </Container>
  );
};

export default ServiceSettings;
