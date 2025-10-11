import Typography from "@mui/material/Typography";
import React from "react";

export const ShowingServicesHeader = ({
  matchedFlowsCount,
}: {
  matchedFlowsCount: number;
}) => {
  const showingServicesMessage =
    matchedFlowsCount !== 1
      ? `Showing ${matchedFlowsCount} flows`
      : `Showing ${matchedFlowsCount} flow`;

  return (
    <Typography variant="h4" component="h2">
      {showingServicesMessage}
    </Typography>
  );
};
