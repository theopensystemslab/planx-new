import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { IndexedNode } from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import { SearchResult, useSearch } from "hooks/useSearch";
import { debounce } from "lodash";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useMemo, useState } from "react";
import ChecklistItem from "ui/shared/ChecklistItem";
import Input from "ui/shared/Input";

import { DATA_FACETS } from "./facets";
import { NodeSearchResults } from "./NodeSearchResults";

const DEBOUNCE_MS = 500;

interface SearchNodes {
  pattern: string;
  facets: typeof DATA_FACETS;
}

interface SearchHeaderProps {
  onChange: React.Dispatch<React.SetStateAction<SearchResult<IndexedNode>[]>>;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({ onChange }) => {
  const [orderedFlow, setOrderedFlow] = useStore((state) => [
    state.orderedFlow,
    state.setOrderedFlow,
  ]);
  const [isSearching, setIsSearching] = useState(false);
  const [lastSearchedTerm, setLastSearchedTerm] = useState("");

  useEffect(() => {
    if (!orderedFlow) setOrderedFlow();
  }, [orderedFlow, setOrderedFlow]);

  const formik = useFormik<SearchNodes>({
    initialValues: { pattern: "", facets: DATA_FACETS },
    onSubmit: ({ pattern }) => {
      debouncedSearch(pattern);
    },
  });

  const { results, search } = useSearch({
    list: orderedFlow || [],
    keys: formik.values.facets,
  });

  useEffect(() => {
    onChange(results);
  }, [onChange, results]);

  const debouncedSearch = useMemo(
    () =>
      debounce((pattern: string) => {
        console.debug("Search term: ", pattern);
        search(pattern);
        setLastSearchedTerm(pattern);
        setIsSearching(false);
      }, DEBOUNCE_MS),
    [search],
  );

  useEffect(() => {
    if (formik.values.pattern !== lastSearchedTerm) {
      setIsSearching(true);
    }
  }, [formik.values.pattern, lastSearchedTerm]);

  return (
    <form onSubmit={formik.handleSubmit}>
      <Typography
        component={"label"}
        htmlFor="pattern"
        variant="h3"
        mb={1}
        display={"block"}
      >
        Search this flow and internal portals
      </Typography>
      <Box sx={{ display: "flex", position: "relative", alignItems: "center" }}>
        <Input
          id="pattern"
          name="pattern"
          value={formik.values.pattern}
          onChange={(e) => {
            formik.setFieldValue("pattern", e.target.value);
            formik.handleSubmit();
          }}
          inputProps={{ spellCheck: false }}
        />
        {isSearching && (
          <CircularProgress
            size={25}
            sx={(theme) => ({
              position: "absolute",
              right: theme.spacing(1.5),
              zIndex: 1,
            })}
          />
        )}
      </Box>
      <ChecklistItem
        label="Search only data fields"
        id={"search-data-field-facet"}
        checked
        inputProps={{ disabled: true }}
        onChange={() => {}}
        variant="compact"
      />
    </form>
  );
};

const Search: React.FC = () => {
  const [results, setResults] = useState<SearchResult<IndexedNode>[]>([]);

  return (
    <Container component={Box} p={3}>
      <SearchHeader onChange={setResults} />
      <NodeSearchResults results={results} />
    </Container>
  );
};

export default Search;
