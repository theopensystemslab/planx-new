import Typography from "@mui/material/Typography";
import React from "react";
import Banner from "ui/Banner";

const ResultSummary = ({ heading, description, color }: any) => (
  <Banner heading={heading} color={color}>
    {description && (
      <Typography variant="body1" align="left" gutterBottom mt={4}>
        {description}
      </Typography>
    )}
  </Banner>
);

export default ResultSummary;
