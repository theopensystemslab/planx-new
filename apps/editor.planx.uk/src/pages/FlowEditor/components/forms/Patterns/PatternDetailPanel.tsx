import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import React, { useMemo } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

import { buildPatternGraphLayout } from "./buildPatternGraphLayout";
import { PatternThumbnail } from "./PatternThumbnail";
import type { PatternFlow } from "./queries";

interface PatternDetailPanelProps {
  pattern: PatternFlow | null;
}

export const PatternDetailPanel: React.FC<PatternDetailPanelProps> = ({
  pattern,
}) => {
  const layout = useMemo(
    () => (pattern?.data ? buildPatternGraphLayout(pattern.data) : null),
    [pattern],
  );

  if (!pattern) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="textSecondary" variant="body2">
          Select a pattern to see details.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <PatternThumbnail layout={layout} size={160} />
      </Box>
      <Typography variant="body1" sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}>
        {pattern.name}
      </Typography>
      {pattern.summary && (
        <Typography variant="body2">{pattern.summary}</Typography>
      )}
      <Button variant="contained" size="small" disabled>
        Insert pattern
      </Button>
    </Box>
  );
};
