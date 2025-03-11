import Container from "@mui/material/Container";
import React from "react";

import { FooterLinksAndLegalDisclaimer } from "./FlowElements/FooterLinksAndLegalDisclaimer";
import FlowStatus from "./FlowStatus";

const ServiceSettings: React.FC = () => (
  <Container maxWidth="formWrap">
    <FooterLinksAndLegalDisclaimer />
    <FlowStatus />
  </Container>
);

export default ServiceSettings;
