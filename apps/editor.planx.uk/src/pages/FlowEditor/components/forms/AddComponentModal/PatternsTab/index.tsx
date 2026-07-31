import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";
import { SearchBox } from "ui/shared/SearchBox/SearchBox";

import { TabHeader } from "../TabHeader";
import { PatternDetailPanel } from "./PatternDetailPanel";
import { PatternRow } from "./PatternRow";

export interface Pattern {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  // data: Graph | null;
}

const summary =
  "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Praesentium voluptatum excepturi at rem enim distinctio officia";

// TODO: Replace mock data with a query
const MOCK_PATTERNS: Pattern[] = [
  { id: "1", slug: "pattern-1", name: "Pattern 1", summary },
  { id: "2", slug: "pattern-2", name: "Pattern 2", summary },
  { id: "3", slug: "pattern-3", name: "Pattern 3", summary },
  { id: "4", slug: "pattern-4", name: "Pattern 4", summary },
  { id: "5", slug: "pattern-5", name: "Pattern 5", summary },
];

interface Props {
  onInsert: (patternId: string) => void;
}

export const PatternsTab: React.FC<Props> = ({ onInsert }) => {
  const patterns = MOCK_PATTERNS;

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
          {visiblePatterns.length === 0 ? (
            <Typography color="textSecondary" variant="body2" sx={{ p: 2 }}>
              No patterns match your search.
            </Typography>
          ) : (
            visiblePatterns.map((pattern) => (
              <PatternRow
                key={pattern.id}
                pattern={pattern}
                selected={pattern.id === selectedPatternId}
                onClick={() => setSelectedPatternId(pattern.id)}
              />
            ))
          )}
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
