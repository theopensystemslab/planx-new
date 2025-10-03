import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";

import StyledTab from "../../../../../ui/editor/StyledTab";
import { HelpPage } from "./FlowElements/HelpPage";
import { LegalDisclaimer } from "./FlowElements/LegalDisclaimer";
import { PrivacyPage } from "./FlowElements/PrivacyPage";
import { FlowVisibility } from "./FlowVisibility/FlowVisibilitySection";
import { TemplatedFlowStatus } from "./TemplatedFlowStatus/TemplatedFlowStatusSection";

type SettingsTab =
  | "Visibility"
  | "Legal"
  | "HelpPage"
  | "PrivacyPage"
  | "Template";

const Tablist = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.border.main}`,
  marginBottom: theme.spacing(3),
  position: "relative",
  "& .MuiTabs-root": {
    minHeight: 0,
    padding: 0,
  },
  "& .MuiTabs-indicator": {
    height: "4px",
    backgroundColor: theme.palette.info.dark,
  },
  "& .MuiTab-root:first-child": {
    marginLeft: 0,
  },
}));

const ServiceSettings: React.FC = () => {
  const [isTemplatedFrom, isTemplate] = useStore((state) => [
    state.isTemplatedFrom,
    state.isTemplate,
  ]);

  const tabs: { value: SettingsTab; label: string }[] = [
    { value: "Visibility", label: "Visibility" },
    { value: "Legal", label: "Legal disclaimer" },
    { value: "HelpPage", label: "Help page" },
    { value: "PrivacyPage", label: "Privacy page" },
    ...(isTemplatedFrom
      ? [{ value: "Template" as SettingsTab, label: "Template status" }]
      : []),
  ];

  const [activeTab, setActiveTab] = useState<SettingsTab>(tabs[0].value);

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: SettingsTab,
  ) => {
    setActiveTab(newValue);
  };

  return (
    <Container
      maxWidth="formWrap"
      sx={{ display: "flex", flexDirection: "column" }}
    >
      <Typography variant="h3" component="h1" gutterBottom>
        Flow settings
      </Typography>
      <Tablist>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="service settings tabs"
        >
          {tabs.map((tab) => (
            <StyledTab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>
      </Tablist>

      {activeTab === "Visibility" && <FlowVisibility />}

      {activeTab === "Legal" && <LegalDisclaimer />}

      {activeTab === "HelpPage" && <HelpPage />}

      {activeTab === "PrivacyPage" && <PrivacyPage />}

      {activeTab === "Template" && isTemplatedFrom && <TemplatedFlowStatus />}
    </Container>
  );
};

export default ServiceSettings;
