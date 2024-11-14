import Container from "@mui/material/Container";
import React from "react";

import FlowDescription from "./FlowDescription/FlowDescription";
import FlowStatus from "./FlowStatus";
import { FooterLinksAndLegalDisclaimer } from "./FooterLinksAndLegalDisclaimer";

const ServiceSettings: React.FC = () => (
  <Container maxWidth="formWrap">
    <FooterLinksAndLegalDisclaimer />
    <FlowStatus />
    <FlowDescription />
  </Container>
);

export default ServiceSettings;
