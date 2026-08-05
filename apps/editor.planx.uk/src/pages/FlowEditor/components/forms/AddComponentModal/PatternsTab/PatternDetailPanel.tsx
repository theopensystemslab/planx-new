import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

import type { Pattern } from "./queries";
import { usePatternData } from "./usePatterns";
import { getComponentCount } from "./utils";

export const DETAIL_PANEL_WIDTH = 300;

interface Props {
  pattern: Pattern | null;
}

export const PatternDetailPanel: React.FC<Props> = ({ pattern }) => {
  const { data, loading, error } = usePatternData(pattern?.id ?? null);
  const graph = data?.pattern?.data;

  // Null while there's no graph data (loading, error, or nothing previewed)
  const componentCount = graph ? getComponentCount(graph) : null;

  if (!pattern) {
    return (
      <Box sx={{ width: DETAIL_PANEL_WIDTH, flexShrink: 0, p: 2 }}>
        <Typography color="textSecondary" variant="body2">
          Hover a pattern to see details.
        </Typography>
      </Box>
    );
  }

  const componentCountLabel =
    componentCount !== null && componentCount >= 1
      ? `${componentCount} component${componentCount === 1 ? "" : "s"}`
      : null;

  const isEmpty = componentCount === 0;

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
      <Typography variant="body1" sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}>
        {pattern.name}
      </Typography>
      {pattern.summary && (
        <Typography variant="body2">{pattern.summary}</Typography>
      )}
      <Typography
        variant="body3"
        sx={{ color: "text.secondary", minHeight: "1.5em" }}
      >
        {loading ? <Skeleton width={80} /> : componentCountLabel}
      </Typography>
      {error && (
        <Typography color="error" variant="body2">
          Couldn't load this pattern.
        </Typography>
      )}
      {isEmpty && (
        <Typography color="textSecondary" variant="body2">
          This pattern has no components to insert.
        </Typography>
      )}
    </Box>
  );
};
