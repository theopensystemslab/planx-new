import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import { FeaturePlaceholder } from "ui/FeaturePlaceholder";

const ServiceFlags: React.FC = () => {
  return (
    <>
      <Box pb={3} borderBottom={1}>
        <Typography variant="h2" component="h3" gutterBottom>
          <strong>Service flags</strong>
        </Typography>
        <Typography variant="body1">
          Manage the flag sets that this service uses. Flags at the top of a set
          override flags below.
        </Typography>
      </Box>
      <Box py={4} borderBottom={1}>
        <FeaturePlaceholder title="Feature in development" />
      </Box>
    </>
  );
};
export default ServiceFlags;
