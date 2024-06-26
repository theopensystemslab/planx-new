import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import { FeaturePlaceholder } from "ui/editor/FeaturePlaceholder";
import SettingsRow from "ui/editor/SettingsRow";

const Team: React.FC = () => {
  return (
    <Box maxWidth="formWrap" mx="auto">
      <SettingsRow>
        <Typography variant="h2" component="h3" gutterBottom>
          Team
        </Typography>
        <Typography variant="body1">
          Manage who has permission to edit this service.
        </Typography>
      </SettingsRow>
      <SettingsRow>
        <FeaturePlaceholder title="Feature in development" />
      </SettingsRow>
      <hr style={{ margin: "40px 0" }} />
      <SettingsRow>
        <Typography variant="h2" component="h3" gutterBottom>
          Sharing
        </Typography>
        <Typography variant="body1">
          Allow other teams on Plan✕ to find and use your service pattern.
        </Typography>
      </SettingsRow>
      <SettingsRow>
        <FeaturePlaceholder title="Feature in development" />
      </SettingsRow>
    </Box>
  );
};
export default Team;
