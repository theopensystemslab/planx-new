import Container from "@mui/material/Container";
import React from "react";

import { FooterLinksAndLegalDisclaimer } from "./FlowElements/FooterLinksAndLegalDisclaimer";
import FlowStatus from "./FlowStatus";
import { FlowVisibility } from "./FlowVisibility/FlowVisibilitySection";

const ServiceSettings: React.FC = () => (
  <Container
    maxWidth="formWrap"
    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
  >
    <FlowStatus />
    <FlowVisibility />
    <FooterLinksAndLegalDisclaimer />
  </Container>
);

export default ServiceSettings;
