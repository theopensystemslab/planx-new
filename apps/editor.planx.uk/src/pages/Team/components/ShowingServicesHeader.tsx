import Typography from "@mui/material/Typography";
import React from "react";

export const ShowingServicesHeader = ({
  matchedFlowsCount,
  isFiltered = false,
  isPinnedFlows = false,
}: {
  matchedFlowsCount: number;
  isFiltered?: boolean;
  isPinnedFlows?: boolean;
}) => {
  let message =
    matchedFlowsCount !== 1
      ? `Showing ${matchedFlowsCount} flows`
      : `Showing ${matchedFlowsCount} flow`;

  if (isFiltered) {
    message =
      matchedFlowsCount !== 1
        ? `Showing ${matchedFlowsCount} filtered flows`
        : `Showing ${matchedFlowsCount} filtered flow`;
  }

  if (isPinnedFlows) {
    message =
      matchedFlowsCount !== 1
        ? `Showing ${matchedFlowsCount} pinned flows`
        : `Showing ${matchedFlowsCount} pinned flow`;
  }

  return (
    <Typography variant="h4" component="h2">
      {message}
    </Typography>
  );
};
