import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { EllipsesText } from "components/EllipsesText/EllipsesText";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

import { PatternMosaic } from "./PatternMosaic";
import type { Pattern } from "./queries";
import { usePatternData } from "./usePatterns";
import { getPatternCounts } from "./utils";

export const DETAIL_PANEL_WIDTH = 300;

interface Props {
  pattern: Pattern | null;
}

export const PatternDetailPanel: React.FC<Props> = ({ pattern }) => {
  const { data, loading, error } = usePatternData(pattern?.id ?? null);
  const graph = data?.pattern?.data;

  // Null while there's no graph data (loading, error, or nothing previewed)
  const counts = graph ? getPatternCounts(graph) : null;

  if (!pattern) {
    return (
      <Box sx={{ width: DETAIL_PANEL_WIDTH, flexShrink: 0, p: 2 }}>
        <Typography color="textSecondary" variant="body2">
          Hover a pattern to see details.
        </Typography>
      </Box>
    );
  }

  const componentCountLabel = (() => {
    if (!counts) return null;
    const parts: string[] = [];
    if (counts.components > 0) {
      parts.push(
        `${counts.components} component${counts.components === 1 ? "" : "s"}`,
      );
    }
    if (counts.nestedFlows > 0) {
      parts.push(
        `${counts.nestedFlows} nested flow${counts.nestedFlows === 1 ? "" : "s"}`,
      );
    }
    return parts.length ? parts.join(", ") : null;
  })();

  const isEmpty =
    counts !== null && counts.components === 0 && counts.nestedFlows === 0;

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
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "2.2 / 1",
          borderRadius: (theme) => `${theme.shape.borderRadius}px`,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: (theme) => theme.palette.common.white,
          paddingBottom: 1.85,
        }}
      >
        {counts && (
          <PatternMosaic
            seed={pattern.id}
            counts={counts}
            sx={{ maxWidth: "80%", maxHeight: "75%" }}
          />
        )}
        {(loading || componentCountLabel) && (
          <Typography
            variant="body3"
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              textAlign: "center",
              py: 0.5,
            }}
          >
            {loading ? (
              <EllipsesText
                sx={{
                  width: "70px",
                  textAlign: "left",
                  margin: "0 auto",
                }}
                variant="inherit"
              >
                Loading
              </EllipsesText>
            ) : (
              componentCountLabel
            )}
          </Typography>
        )}
      </Box>
      <Stack spacing={1}>
        <Typography variant="body1" sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}>
          {pattern.name}
        </Typography>
        {pattern.summary && (
          <Typography variant="body2">{pattern.summary}</Typography>
        )}
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
      </Stack>
    </Box>
  );
};
