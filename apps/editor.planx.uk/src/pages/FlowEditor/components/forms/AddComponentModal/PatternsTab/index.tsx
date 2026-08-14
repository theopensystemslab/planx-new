import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { Graph } from "@planx/graph";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import React, { useState } from "react";
import { SearchBox } from "ui/shared/SearchBox/SearchBox";

import { TabHeader } from "../TabHeader";
import { PatternRow } from "./PatternRow";
import type { Pattern } from "./queries";
import { useFetchPatternGraph, usePatterns } from "./usePatterns";
import { getComponentCount } from "./utils";

interface Props {
  onInsert: (graph: Graph) => void;
}

export const PatternsTab: React.FC<Props> = ({ onInsert }) => {
  const { data, loading, error } = usePatterns();
  const patterns = data?.patterns ?? [];

  const [searchedPatterns, setSearchedPatterns] = useState<Pattern[] | null>(
    null,
  );
  const visiblePatterns = searchedPatterns ?? patterns;

  const [insertError, setInsertError] = useState<{
    id: string;
    message: string;
  } | null>(null);

  const fetchPatternGraph = useFetchPatternGraph();

  const insertPattern = async (id: string) => {
    setInsertError(null);
    const patternGraph = await fetchPatternGraph(id);
    if (!patternGraph) {
      setInsertError({ id, message: "Couldn't load this pattern." });
      return;
    }
    // A pattern needs at least one component to be insertable
    // We should aim to catch this when a pattern is made copyable
    if (getComponentCount(patternGraph) === 0) {
      setInsertError({
        id,
        message: "This pattern has no components to insert.",
      });
      return;
    }
    onInsert(patternGraph);
  };

  return (
    <>
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
        {loading && <DelayedLoadingIndicator inline text="Loading patterns" />}
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
              error={
                insertError?.id === pattern.id ? insertError.message : null
              }
              onSelect={() => insertPattern(pattern.id)}
            />
          ))}
      </Box>
    </>
  );
};
