import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import { FeaturePlaceholder } from "ui/editor/FeaturePlaceholder";
import SettingsRow from "ui/editor/SettingsRow";

const DataManagerSettings: React.FC = () => {
  return (
    <Box maxWidth="formWrap" mx="auto">
      <SettingsRow>
        <Typography variant="h2" component="h3" gutterBottom>
          Data Manager
        </Typography>
        <Typography variant="body1">
          Manage the data that your service uses and makes available via its
          API.
        </Typography>
      </SettingsRow>
      <SettingsRow>
        <FeaturePlaceholder title="Feature in development" />
      </SettingsRow>
    </Box>
  );
};
export default DataManagerSettings;
