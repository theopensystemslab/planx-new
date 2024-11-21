import ErrorOutline from "@mui/icons-material/ErrorOutline";
import Typography from "@mui/material/Typography";
import { WarningContainer } from "@planx/components/shared/Preview/WarningContainer";
import React from "react";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

export const Disclaimer = ({ text }: { text: string }) => {
  return (
    <WarningContainer>
      <ErrorOutline />
      <Typography
        variant="body2"
        component="div"
        ml={2}
        sx={{ "& p:first-of-type": { marginTop: 0 } }}
      >
        <ReactMarkdownOrHtml source={text} openLinksOnNewTab />
      </Typography>
    </WarningContainer>
  );
};
