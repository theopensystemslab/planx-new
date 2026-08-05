import Box from "@mui/material/Box";
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
}

export const PatternDetailPanel: React.FC<Props> = ({ pattern }) => {
  const componentCount = pattern ? getComponentCount(pattern.data) : 0;
  const countLabel = componentCountLabel(componentCount);
  const isEmpty = componentCount < 1;

  if (!pattern) {
    return (
      <Box sx={{ width: DETAIL_PANEL_WIDTH, flexShrink: 0, p: 2 }}>
        <Typography color="textSecondary" variant="body2">
          Hover a pattern to see details.
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
      <Typography variant="body1" sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}>
        {pattern.name}
      </Typography>
      {pattern.summary && (
        <Typography variant="body2">{pattern.summary}</Typography>
      )}
      {isEmpty && (
        <Typography color="textSecondary" variant="body2">
          This pattern has no components to insert.
        </Typography>
      )}
    </Box>
  );
};
