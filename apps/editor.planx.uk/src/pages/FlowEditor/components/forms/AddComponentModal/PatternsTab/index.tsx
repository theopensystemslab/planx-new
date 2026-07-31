import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import React, { useState } from "react";
import { SearchBox } from "ui/shared/SearchBox/SearchBox";

import { TabHeader } from "../TabHeader";
import { PatternDetailPanel } from "./PatternDetailPanel";
import { PatternRow } from "./PatternRow";
import type { Pattern } from "./queries";
import { usePatterns } from "./usePatterns";

interface Props {
  onInsert: (patternId: string) => void;
}

export const PatternsTab: React.FC<Props> = ({ onInsert }) => {
  const { data, loading, error } = usePatterns();
  const patterns = data?.patterns ?? [];

  const [searchedPatterns, setSearchedPatterns] = useState<Pattern[] | null>(
    null,
  );
  const visiblePatterns = searchedPatterns ?? patterns;

  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(
    null,
  );
  const selectedPattern =
    visiblePatterns.find((pattern) => pattern.id === selectedPatternId) ?? null;

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
        <TabHeader>
          <SearchBox<Pattern>
            records={patterns}
            setRecords={setSearchedPatterns}
            searchKey={["name", "summary"]}
            compact
            hideLabel
            fullWidth
            placeholder="Search patterns"
          />
        </TabHeader>
        <Box sx={{ overflowY: "auto", minHeight: 0, pb: 2 }}>
          {loading && (
            <DelayedLoadingIndicator inline text="Loading patterns" />
          )}
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
                selected={pattern.id === selectedPatternId}
                onClick={() => setSelectedPatternId(pattern.id)}
              />
            ))}
        </Box>
      </Box>
      <PatternDetailPanel
        pattern={selectedPattern}
        onInsert={onInsert}
        onClear={() => setSelectedPatternId(null)}
      />
    </Box>
  );
};
