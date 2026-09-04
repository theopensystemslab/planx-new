import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { useTheme } from "@mui/material/styles";
import { useFormik } from "formik";
import { useSearch } from "hooks/useSearch";
import { debounce } from "lodash";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { forwardRef, useEffect, useMemo, useState } from "react";
import type { Components } from "react-virtuoso";
import { Virtuoso } from "react-virtuoso";
import { SEARCH_DEBOUNCE_MS } from "ui/shared/constants";

import { ExternalPortalList } from "./ExternalPortalList/ExternalPortalList";
import type { SearchFacets } from "./facets";
import { ALL_FACETS } from "./facets";
import { SearchHeader } from "./SearchHeader";
import { SearchResultCard } from "./SearchResultCard";
import type { SearchableResult } from "./types";

interface SearchNodes {
  pattern: string;
  facets: SearchFacets;
}

// Types for Virtuoso
export type Data = SearchableResult;
export type Context = {
  results: SearchableResult[];
  formik: ReturnType<typeof useFormik<SearchNodes>>;
  isSearching: boolean;
  lastPattern: string;
  setIsSearching: React.Dispatch<React.SetStateAction<boolean>>;
};

/**
 * Accessibility - Render the Virtuoso list as a HTMLUListElement, not a HTMLDivElement
 */
const ListComponent = forwardRef<HTMLUListElement>((props, ref) => (
  <List {...props} ref={ref} sx={{ mx: 3 }} />
)) as Components<Data, Context>["List"];

/**
 * Accessibility - Render the Virtuoso item as a HTMLLiElement, not a HTMLDivElement
 */
const ListItemComponent = forwardRef<HTMLLIElement>((props, ref) => (
  <ListItem disablePadding sx={{ pb: 2 }} {...props} ref={ref} />
)) as Components<Data, Context>["Item"];

/**
 * Search uses Virtuoso to generate a virtualised list of search results
 */
const Search: React.FC = () => {
  // Get ordered flow of indexed nodes from store
  const [orderedFlow, setOrderedFlow, flowId] = useStore((state) => [
    state.orderedFlow,
    state.setOrderedFlow,
    state.id,
  ]);

  useEffect(() => {
    setOrderedFlow();
  }, [flowId, setOrderedFlow]);

  // Set up search input form
  const formik = useFormik<SearchNodes>({
    initialValues: { pattern: "", facets: ALL_FACETS },
    onSubmit: ({ pattern }) => {
      debouncedSearch(pattern);
    },
  });

  // Set up spinner UI in search bar
  const [isSearching, setIsSearching] = useState(false);
  const [lastPattern, setLastPattern] = useState("");

  // Call custom hook to control searching
  const { results: nodeResults, search: searchNodes } = useSearch({
    list: orderedFlow || [],
    keys: formik.values.facets,
  });

  // Order node search results by relevance
  const results = useMemo<SearchableResult[]>(
    () => nodeResults.sort((a, b) => a.score - b.score),
    [nodeResults],
  );

  const debouncedSearch = useMemo(
    () =>
      debounce((pattern: string) => {
        console.debug("Search term: ", pattern);
        searchNodes(pattern);
        setLastPattern(pattern);
        setIsSearching(false);
      }, SEARCH_DEBOUNCE_MS),
    [searchNodes],
  );

  const theme = useTheme();
  const backgroundStyle = {
    background: theme.palette.background.paper,
  };

  return (
    <Virtuoso<Data, Context>
      style={backgroundStyle}
      totalCount={results.length}
      context={{
        results,
        isSearching,
        lastPattern,
        formik,
        setIsSearching,
      }}
      components={{
        Footer: ExternalPortalList,
        List: ListComponent,
        Item: ListItemComponent,
        Header: SearchHeader,
      }}
      itemContent={(index) => <SearchResultCard result={results[index]} />}
    />
  );
};

export default Search;
