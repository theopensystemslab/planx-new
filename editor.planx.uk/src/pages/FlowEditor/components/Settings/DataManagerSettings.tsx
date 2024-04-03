import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import EditorRow from "ui/editor/EditorRow";
import { FeaturePlaceholder } from "ui/editor/FeaturePlaceholder";

const DataManagerSettings: React.FC = () => {
  return (
    <Box maxWidth="formWrap" mx="auto">
      <EditorRow>
        <Typography variant="h2" component="h3">
          Data Manager
        </Typography>
        <Typography variant="body1">
          Manage the data that your service uses and makes available via its
          API.
        </Typography>
      </EditorRow>
      <EditorRow>
        <FeaturePlaceholder title="Feature in development" />
      </EditorRow>
    </Box>
  );
};
export default DataManagerSettings;
