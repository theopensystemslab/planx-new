import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import { FeaturePlaceholder } from "ui/editor/FeaturePlaceholder";
import SettingsSection from "ui/editor/SettingsSection";

const Team: React.FC = () => {
  return (
    <Box maxWidth="formWrap" mx="auto">
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Team
        </Typography>
        <Typography variant="body1">
          Manage who has permission to edit this service.
        </Typography>
      </SettingsSection>
      <SettingsSection>
        <FeaturePlaceholder title="Feature in development" />
      </SettingsSection>
      <hr style={{ margin: "40px 0" }} />
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Sharing
        </Typography>
        <Typography variant="body1">
          Allow other teams on Plan✕ to find and use your service pattern.
        </Typography>
      </SettingsSection>
      <SettingsSection>
        <FeaturePlaceholder title="Feature in development" />
      </SettingsSection>
    </Box>
  );
};
export default Team;
