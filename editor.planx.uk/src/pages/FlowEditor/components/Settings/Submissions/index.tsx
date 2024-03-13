import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import { FeaturePlaceholder } from "ui/editor/FeaturePlaceholder";

const Submissions: React.FC = () => {
  return (
    <>
      <Box>
        <Typography variant="h2" component="h3" gutterBottom>
          Submissions
        </Typography>
        <Typography variant="body1">
          View data on the user submitted applications for this service.
        </Typography>
        <Box py={5}>
          <FeaturePlaceholder title="Feature in development" />
        </Box>
      </Box>
    </>
  );
};

export default Submissions;
