import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React, { PropsWithChildren } from "react";

export default function FeedbackDisclaimer({
  children,
}: PropsWithChildren): FCReturn {
  return (
    <Box>
      <Typography variant="body2">{children}</Typography>
    </Box>
  );
}
