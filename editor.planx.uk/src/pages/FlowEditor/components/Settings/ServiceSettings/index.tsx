import Container from "@mui/material/Container";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";

import FlowDescription from "./FlowDescription/FlowDescription";
import FlowStatus from "./FlowStatus";
import { FooterLinksAndLegalDisclaimer } from "./FooterLinksAndLegalDisclaimer";

const ServiceSettings: React.FC = () => {
  const [flowSlug, teamSlug, getFlowSettings] = useStore((state) => [
    state.flowSlug,
    state.teamSlug,
    state.getFlowSettings,
  ]);

  useEffect(() => {
    const fetchFlowSettings = async () => {
      await getFlowSettings(flowSlug, teamSlug);
    };
    fetchFlowSettings();
  }, [flowSlug, teamSlug, getFlowSettings]);

  return (
    <Container maxWidth="formWrap">
      <FooterLinksAndLegalDisclaimer />
      <FlowStatus />
      <FlowDescription />
    </Container>
  );
};

export default ServiceSettings;
