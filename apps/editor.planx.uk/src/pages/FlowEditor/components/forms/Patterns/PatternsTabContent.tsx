import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import React, { useMemo, useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { SearchBox } from "ui/shared/SearchBox/SearchBox";

import { buildPatternGraphLayout } from "./buildPatternGraphLayout";
import { PatternDetailPanel } from "./PatternDetailPanel";
import { PatternThumbnail } from "./PatternThumbnail";
import type { PatternFlow } from "./queries";
import { usePatterns } from "./usePatterns";

export const DETAIL_PANEL_WIDTH = 300;

interface PatternRowProps {
  pattern: PatternFlow;
  selected: boolean;
  onClick: () => void;
}

const PatternRow: React.FC<PatternRowProps> = ({
  pattern,
  selected,
  onClick,
}) => {
  const layout = useMemo(
    () => (pattern.data ? buildPatternGraphLayout(pattern.data) : null),
    [pattern],
  );
  const componentCount = layout?.nodes.length ?? 0;

  return (
    <Box
      onClick={onClick}
      data-testid={`pattern-${pattern.id}`}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 1.5,
        py: 1,
        cursor: "pointer",
        backgroundColor: selected ? "action.selected" : "transparent",
        "&:hover": {
          backgroundColor: selected ? "action.selected" : "action.hover",
        },
      }}
    >
      <PatternThumbnail layout={layout} size={40} />
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
          noWrap
        >
          {pattern.name}
        </Typography>
        <Typography
          variant="body3"
          noWrap
          sx={{ color: "text.secondary", display: "block" }}
        >
          {componentCount} component{componentCount === 1 ? "" : "s"}
        </Typography>
      </Box>
    </Box>
  );
};

export const PatternsTabContent: React.FC = () => {
  const { data, loading, error } = usePatterns();
  const [searchedPatterns, setSearchedPatterns] = useState<
    PatternFlow[] | null
  >(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const patterns = data?.flows ?? [];
  const visiblePatterns = searchedPatterns ?? patterns;
  const selectedPattern =
    patterns.find((pattern) => pattern.id === selectedId) ?? null;

  return (
    <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
          borderRight: 1,
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            px: 1.5,
            py: 1.25,
            borderBottom: 1,
            borderColor: "divider",
            backgroundColor: "background.paper",
          }}
        >
          <SearchBox<PatternFlow>
            records={patterns}
            setRecords={setSearchedPatterns}
            searchKey={["name", "summary"]}
            compact
            hideLabel
            fullWidth
            placeholder="Search patterns"
          />
        </Box>
        <Box sx={{ overflowY: "auto", pb: 2 }}>
          {loading && <DelayedLoadingIndicator text="Loading patterns" />}
          {!loading && error && (
            <Typography color="error" variant="body2" sx={{ p: 2 }}>
              Couldn't load patterns.
            </Typography>
          )}
          {!loading && !error && visiblePatterns.length === 0 && (
            <Typography color="textSecondary" variant="body2" sx={{ p: 2 }}>
              {patterns.length === 0
                ? "No patterns available yet."
                : "No patterns match your search."}
            </Typography>
          )}
          {!loading &&
            !error &&
            visiblePatterns.map((pattern) => (
              <PatternRow
                key={pattern.id}
                pattern={pattern}
                selected={pattern.id === selectedId}
                onClick={() => setSelectedId(pattern.id)}
              />
            ))}
        </Box>
      </Box>
      <Box sx={{ width: DETAIL_PANEL_WIDTH, flexShrink: 0, overflowY: "auto" }}>
        <PatternDetailPanel pattern={selectedPattern} />
      </Box>
    </Box>
  );
};
