import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import type { Graph } from "@planx/graph";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

import { PatternThumbnailImage } from "./PatternThumbnailImage";
import type { PatternFlow } from "./queries";

interface PatternDetailPanelProps {
  pattern: PatternFlow | null;
  onInsertPattern: (graph: Graph) => void;
}

export const PatternDetailPanel: React.FC<PatternDetailPanelProps> = ({
  pattern,
  onInsertPattern,
}) => {
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
      <PatternThumbnailImage
        key={pattern.id}
        patternId={pattern.id}
        graph={pattern.data}
      />
      <Typography variant="body1" sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}>
        {pattern.name}
      </Typography>
      {pattern.summary && (
        <Typography variant="body2">{pattern.summary}</Typography>
      )}
      <Button
        variant="contained"
        size="small"
        disabled={!pattern.data}
        onClick={() => pattern.data && onInsertPattern(pattern.data)}
      >
        Insert pattern
      </Button>
    </Box>
  );
};
