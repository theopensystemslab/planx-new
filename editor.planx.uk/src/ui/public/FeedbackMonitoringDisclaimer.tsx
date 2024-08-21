import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";

export default function FeedbackMonitoringDisclaimer(): FCReturn {
  return (
    <Box>
      <Typography variant="body2">
        This information is not monitored frequently by planning officers, do
        not use it to provide extra information or queries with regard to your
        application or project. Any information of this nature will be
        disregarded.
      </Typography>
    </Box>
  );
}
