import Container from "@mui/material/Container";
import React from "react";

import { FlowStatus } from "./FlowStatus";
import { FooterLinksAndLegalDisclaimer } from "./FooterLinksAndLegalDisclaimer";

const ServiceSettings: React.FC = () => (
  <Container maxWidth="formWrap">
    <FooterLinksAndLegalDisclaimer />
    <FlowStatus />
  </Container>
);

export default ServiceSettings;
