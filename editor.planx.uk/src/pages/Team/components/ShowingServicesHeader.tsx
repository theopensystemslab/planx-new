import Box from "@mui/material/Box";
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
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Typography variant="h3" component="h2">
        {showingServicesMessage}
      </Typography>
    </Box>
  );
};
