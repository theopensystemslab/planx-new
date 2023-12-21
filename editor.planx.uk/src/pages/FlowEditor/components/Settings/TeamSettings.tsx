import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import { FeaturePlaceholder } from "ui/editor/FeaturePlaceholder";

const Team: React.FC = () => {
  return (
    <>
      <Box borderBottom={1}>
        <Typography variant="h2" component="h3" gutterBottom>
          Team
        </Typography>
        <Typography variant="body1">
          Manage who has permission to edit this service
        </Typography>
        <Box py={5}>
          <FeaturePlaceholder title="Feature in development" />
        </Box>
      </Box>
      <Box pt={3}>
        <Typography variant="h2" component="h3" gutterBottom>
          Sharing
        </Typography>
        <Typography variant="body1">
          Allow other teams on Plan✕ to find and use your service pattern
        </Typography>
        <Box py={5}>
          <FeaturePlaceholder title="Feature in development" />
        </Box>
      </Box>
    </>
  );
};
export default Team;
