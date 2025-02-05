import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import SettingsSection from "ui/editor/SettingsSection";

import { TeamData } from "./components";

export const PlatformAdminPanel = () => {
  const adminPanelData = useStore((state) => state.adminPanelData);

  return (
    <Container maxWidth={false}>
      <SettingsSection>
        <Typography variant="h2" component="h1" gutterBottom>
          Platform admin panel
        </Typography>
        <Typography variant="body1">
          {`This is an overview of each team's integrations and settings for the `}
          <strong>{import.meta.env.VITE_APP_ENV}</strong>
          {` environment.`}
        </Typography>
      </SettingsSection>
      <SettingsSection>
        {adminPanelData?.map((team) => <TeamData key={team.id} data={team} />)}
      </SettingsSection>
    </Container>
  );
};
