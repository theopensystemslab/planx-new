import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import EditorRow from "ui/editor/EditorRow";
import { FeaturePlaceholder } from "ui/editor/FeaturePlaceholder";

const ServiceFlags: React.FC = () => {
  return (
    <Box maxWidth="formWrap" mx="auto">
      <EditorRow>
        <Typography variant="h2" component="h3">
          Service flags
        </Typography>
        <Typography variant="body1">
          Manage the flag sets that this service uses. Flags at the top of a set
          override flags below.
        </Typography>
      </EditorRow>
      <EditorRow>
        <FeaturePlaceholder title="Feature in development" />
      </EditorRow>
    </Box>
  );
};
export default ServiceFlags;
