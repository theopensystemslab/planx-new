import Typography from "@mui/material/Typography";
import React from "react";

export const ShowingServicesHeader = ({
  matchedFlowsCount,
  isFiltered = false,
  isPinnedFlows = false,
  isArchived = false,
}: {
  matchedFlowsCount: number;
  isFiltered?: boolean;
  isPinnedFlows?: boolean;
  isArchived?: boolean;
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

  if (isArchived && !isFiltered) {
    message =
      matchedFlowsCount !== 1
        ? `Showing ${matchedFlowsCount} archived flows`
        : `Showing ${matchedFlowsCount} archived flow`;
  }

  if (isArchived && isFiltered) {
    message =
      matchedFlowsCount !== 1
        ? `Showing ${matchedFlowsCount} filtered archived flows`
        : `Showing ${matchedFlowsCount} filtered archived flow`;
  }

  return (
    <Typography variant="h4" component="h2">
      {message}
    </Typography>
  );
};
