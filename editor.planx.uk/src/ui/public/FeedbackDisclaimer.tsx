import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import React from "react";

export default function FeedbackDisclaimer(): FCReturn {
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
