import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import React, { useEffect, useState } from "react";

export const ShowingServicesTitle = ({
  matchedFlows,
}: {
  matchedFlows: FlowSummary[] | null;
}) => {
  const [numberOfFlows, setNumberOfFlows] = useState(matchedFlows?.length || 0);

  useEffect(() => {
    setNumberOfFlows(matchedFlows?.length || 0);
  }, [matchedFlows]);

  const showingServicesMessage =
    numberOfFlows !== 1
      ? `Showing ${numberOfFlows} services`
      : `Showing ${numberOfFlows} service`;

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
