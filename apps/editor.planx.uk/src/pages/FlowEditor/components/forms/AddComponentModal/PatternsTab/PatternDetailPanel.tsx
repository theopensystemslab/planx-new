import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

import type { Pattern } from "./queries";
import { usePatternData } from "./usePatterns";

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
}) => {
  const { data, loading, error } = usePatternData(pattern?.id ?? null);
  const graph = data?.pattern?.data;

  const componentCount = Math.max(Object.keys(graph || {}).length - 1, 0);

  if (!pattern) {
    return (
      <Box sx={{ width: DETAIL_PANEL_WIDTH, flexShrink: 0, p: 2 }}>
        <Typography color="textSecondary" variant="body2">
          Select a pattern to see details.
        </Typography>
      </Box>
    );
  }

  return (
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
      {componentCount && (
        <Typography variant="body3" sx={{ color: "text.secondary" }}>
          {componentCount} components
        </Typography>
      )}
      {error && (
        <Typography color="error" variant="body2">
          Couldn't load this pattern.
        </Typography>
      )}
      <Button
        variant="contained"
        size="small"
        disabled={loading || Boolean(error) || !graph}
        onClick={() => onInsert(pattern.id)}
      >
        {loading ? "Loading…" : "Insert pattern"}
      </Button>
    </Box>
  );
};
