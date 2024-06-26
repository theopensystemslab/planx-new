import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import { FeaturePlaceholder } from "ui/editor/FeaturePlaceholder";
import SettingsRow from "ui/editor/SettingsRow";

const ServiceFlags: React.FC = () => {
  return (
    <Box maxWidth="formWrap" mx="auto">
      <SettingsRow>
        <Typography variant="h2" component="h3" gutterBottom>
          Service flags
        </Typography>
        <Typography variant="body1">
          Manage the flag sets that this service uses. Flags at the top of a set
          override flags below.
        </Typography>
      </SettingsRow>
      <SettingsRow>
        <FeaturePlaceholder title="Feature in development" />
      </SettingsRow>
    </Box>
  );
};
export default ServiceFlags;
