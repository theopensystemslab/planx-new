import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import EditorRow from "ui/editor/EditorRow";
import { FeaturePlaceholder } from "ui/editor/FeaturePlaceholder";

const Team: React.FC = () => {
  return (
    <Box maxWidth="formWrap" mx="auto">
      <EditorRow>
        <Typography variant="h2" component="h3">
          Team
        </Typography>
        <Typography variant="body1">
          Manage who has permission to edit this service.
        </Typography>
      </EditorRow>
      <EditorRow>
        <FeaturePlaceholder title="Feature in development" />
      </EditorRow>
      <hr />
      <EditorRow>
        <Typography variant="h2" component="h3">
          Sharing
        </Typography>
        <Typography variant="body1">
          Allow other teams on Plan✕ to find and use your service pattern.
        </Typography>
      </EditorRow>
      <EditorRow>
        <FeaturePlaceholder title="Feature in development" />
      </EditorRow>
    </Box>
  );
};
export default Team;
