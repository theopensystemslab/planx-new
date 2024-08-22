import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";

interface FeedbackDisclaimerProps {
  children: React.ReactNode;
}

export default function FeedbackDisclaimer({
  children,
}: FeedbackDisclaimerProps): FCReturn {
  return (
    <Box>
      <Typography variant="body2">{children}</Typography>
    </Box>
  );
}
