import Typography from "@mui/material/Typography";
import React from "react";

export const ShowingServicesHeader = ({
  matchedFlowsCount,
}: {
  matchedFlowsCount: number;
}) => {
  const showingServicesMessage =
    matchedFlowsCount !== 1
      ? `Showing ${matchedFlowsCount} services`
      : `Showing ${matchedFlowsCount} service`;

  return (
    <Typography variant="h3" component="h2">
      {showingServicesMessage}
    </Typography>
  );
};
