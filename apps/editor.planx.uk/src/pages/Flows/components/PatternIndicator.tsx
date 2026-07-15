import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

export const PatternIndicator: React.FC = () => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 0.25,
    }}
  >
    <Typography variant="body3" sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}>
      {`Pattern`}
    </Typography>
  </Box>
);
