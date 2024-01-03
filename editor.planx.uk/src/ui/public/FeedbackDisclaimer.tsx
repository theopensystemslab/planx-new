import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import React from "react";

export default function FeedbackDisclaimer(): FCReturn {
  return (
    <Box>
      <Typography variant="body2">
        Please do not include any personal or financial information in your
        feedback. If you choose to do so we will process your personal data
        according to our <Link>privacy policy</Link>.
      </Typography>
    </Box>
  );
}
