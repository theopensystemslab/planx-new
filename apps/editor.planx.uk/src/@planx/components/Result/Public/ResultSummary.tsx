import Typography from "@mui/material/Typography";
import React from "react";
import Banner from "ui/public/Banner";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

const ResultSummary = ({ heading, description, color }: any) => (
  <Banner heading={heading} color={color}>
    {description && (
      <Typography variant="body1" align="left" gutterBottom maxWidth="formWrap">
        <ReactMarkdownOrHtml source={description} openLinksOnNewTab />
      </Typography>
    )}
  </Banner>
);

export default ResultSummary;
