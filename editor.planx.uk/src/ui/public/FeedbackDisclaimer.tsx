import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";

export function FeedbackMonitoringDisclaimer(): FCReturn {
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

export function FeedbackDataDisclaimer(): FCReturn {
  return (
    <Box>
      <Typography variant="body2">
        Do not share personal or financial information in your feedback. If you
        do we’ll act according to our{" "}
        <Link
          href="https://www.planx.uk/privacy"
          target="_blank"
          rel="noopener"
        >
          privacy policy
        </Link>
        .
      </Typography>
    </Box>
  );
}
