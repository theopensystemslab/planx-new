import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import React from "react";
import { FeaturePlaceholder } from "ui/editor/FeaturePlaceholder";
import SettingsSection from "ui/editor/SettingsSection";

const ServiceFlags: React.FC = () => {
  return (
    <Container maxWidth="formWrap">
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Service flags
        </Typography>
        <Typography variant="body1">
          Manage the flag sets that this service uses. Flags at the top of a set
          override flags below.
        </Typography>
      </SettingsSection>
      <SettingsSection>
        <FeaturePlaceholder title="Feature in development" />
      </SettingsSection>
    </Container>
  );
};
export default ServiceFlags;
