import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import { FeaturePlaceholder } from "ui/FeaturePlaceholder";

const DesignSettings: React.FC = () => {
  return (
    <>
      <Box>
        <Typography variant="h2" component="h3" gutterBottom>
          Design
        </Typography>
        <Typography variant="body1">
          How your service appears to public users
        </Typography>
        <Box py={5}>
          <FeaturePlaceholder title="Feature in development" />
        </Box>
      </Box>
    </>
  );
};
export default DesignSettings;