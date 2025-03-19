import Container from "@mui/material/Container";
import React from "react";

import FlowStatus from "./FlowStatus";
import { FooterLinksAndLegalDisclaimer } from "./FooterLinksAndLegalDisclaimer";

const ServiceSettings: React.FC = () => (
  <Container
    maxWidth="formWrap"
    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
  >
    <FlowStatus />
    <FooterLinksAndLegalDisclaimer />
  </Container>
);

export default ServiceSettings;
