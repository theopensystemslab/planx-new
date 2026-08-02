import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

import { PatternPreview } from "./PatternPreview";
import type { Pattern } from "./queries";
import { componentCountLabel, getComponentCount } from "./utils";

export const DETAIL_PANEL_WIDTH = 300;
const PREVIEW_HEIGHT = 130;

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
  const componentCount = pattern ? getComponentCount(pattern.data) : 0;
  const countLabel = componentCountLabel(componentCount);

  // A pattern needs at least one component to be insertable
  // We should aim to catch this when a pattern is made copyable
  const isEmpty = componentCount < 1;
  const canInsert = Boolean(pattern) && !isEmpty;

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
      data-testid="pattern-detail-panel"
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
      {!isEmpty && (
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            height: PREVIEW_HEIGHT,
            p: 1.5,
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            backgroundColor: "background.default",
          }}
        >
          <PatternPreview
            componentCount={componentCount}
            sx={{ flex: "0 0 45%" }}
          />
          <Typography
            variant="body3"
            sx={{ alignSelf: "flex-end", lineHeight: 1 }}
          >
            {countLabel}
          </Typography>
        </Box>
      )}
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
      {isEmpty && (
        <Typography color="textSecondary" variant="body2">
          This pattern has no components to insert.
        </Typography>
      )}
      <Button
        variant="contained"
        size="small"
        fullWidth
        disabled={!canInsert}
        onClick={() => onInsert(pattern.id)}
      >
        Insert pattern
      </Button>
    </Box>
  );
};
