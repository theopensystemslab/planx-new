import ErrorOutline from "@mui/icons-material/ErrorOutline";
import Typography from "@mui/material/Typography";
import { WarningContainer } from "@planx/components/shared/Preview/WarningContainer";
import React from "react";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

export const Disclaimer = ({ text }: { text: string }) => (
  <WarningContainer>
    <ErrorOutline />
    <Typography variant="body1" component="div" ml={2} mb={1}>
      <ReactMarkdownOrHtml source={text} openLinksOnNewTab />
    </Typography>
  </WarningContainer>
);
