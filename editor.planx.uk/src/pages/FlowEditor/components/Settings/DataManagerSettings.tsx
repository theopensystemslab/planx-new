import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import React from "react";
import { FeaturePlaceholder } from "ui/editor/FeaturePlaceholder";
import SettingsSection from "ui/editor/SettingsSection";

const DataManagerSettings: React.FC = () => {
  return (
    <Container maxWidth="formWrap">
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Data Manager
        </Typography>
        <Typography variant="body1">
          Manage the data that your service uses and makes available via its
          API.
        </Typography>
      </SettingsSection>
      <SettingsSection>
        <FeaturePlaceholder title="Feature in development" />
      </SettingsSection>
    </Container>
  );
};
export default DataManagerSettings;
