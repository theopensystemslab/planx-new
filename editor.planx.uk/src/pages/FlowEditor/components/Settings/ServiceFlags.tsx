import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import { FeaturePlaceholder } from "ui/editor/FeaturePlaceholder";

const ServiceFlags: React.FC = () => {
  return (
    <Box>
      <Typography variant="h2" component="h3" gutterBottom>
        Service flags
      </Typography>
      <Typography variant="body1">
        Manage the flag sets that this service uses. Flags at the top of a set
        override flags below.
      </Typography>
      <Box py={5}>
        <FeaturePlaceholder title="Feature in development" />
      </Box>
    </Box>
  );
};
export default ServiceFlags;
