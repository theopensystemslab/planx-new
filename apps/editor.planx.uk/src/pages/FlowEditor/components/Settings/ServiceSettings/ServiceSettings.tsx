import Container from "@mui/material/Container";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import { FooterLinksAndLegalDisclaimer } from "./FlowElements/FooterLinksAndLegalDisclaimer";
import FlowStatus from "./FlowStatus";
import { FlowVisibility } from "./FlowVisibility/FlowVisibilitySection";
import { LPSListing } from "./LPS/LPSListingSection";

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
      <LPSListing />
    </Container>
  );
};

export default ServiceSettings;
