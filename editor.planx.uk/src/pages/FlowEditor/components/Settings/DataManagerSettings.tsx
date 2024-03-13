import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import { FeaturePlaceholder } from "ui/editor/FeaturePlaceholder";

const DataManagerSettings: React.FC = () => {
  return (
    <Box>
      <Typography variant="h2" component="h3" gutterBottom>
        Data Manager
      </Typography>
      <Typography variant="body1">
        Manage the data that your service uses and makes available via its API
      </Typography>
      <Box py={5}>
        <FeaturePlaceholder title="Feature in development" />
      </Box>
    </Box>
  );
};
export default DataManagerSettings;
