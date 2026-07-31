import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

import type { Pattern } from ".";

export const DETAIL_PANEL_WIDTH = 300;

interface Props {
  pattern: Pattern | null;
  onInsert: (patternId: string) => void;
  onClear: () => void;
}

export const PatternDetailPanel: React.FC<Props> = ({
  pattern,
  onInsert,
  onClear,
}) => (
  <Box
    sx={{
      width: DETAIL_PANEL_WIDTH,
      flexShrink: 0,
      overflowY: "auto",
      p: 2,
      display: "flex",
      flexDirection: "column",
      gap: 1.5,
    }}
  >
    {pattern ? (
      <>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <Typography
            variant="body1"
            sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD, flexGrow: 1 }}
          >
            {pattern.name}
          </Typography>
          <IconButton
            onClick={onClear}
            aria-label={`Close ${pattern.name} details`}
            size="small"
            sx={{ mt: -0.5, mr: -0.5 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        {pattern.summary && (
          <Typography variant="body2">{pattern.summary}</Typography>
        )}
        <Button
          variant="contained"
          size="small"
          // disabled={!pattern.data}
          onClick={() => onInsert(pattern.id)}
        >
          Insert pattern
        </Button>
      </>
    ) : (
      <Typography color="textSecondary" variant="body2">
        Select a pattern to see details.
      </Typography>
    )}
  </Box>
);
