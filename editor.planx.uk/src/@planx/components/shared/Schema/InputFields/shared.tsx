import Typography from "@mui/material/Typography";
import React from "react";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml";

interface FieldInputDescriptionProps {
  description: string;
}

export const FieldInputDescription: React.FC<FieldInputDescriptionProps> = ({
  description,
}) => (
  <Typography variant="body2" mb={1.5}>
    <ReactMarkdownOrHtml
      source={description}
      openLinksOnNewTab
      // TODO a11y props? eg `id={DESCRIPTION_TEXT}` but unique ??
    />
  </Typography>
);
