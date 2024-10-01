import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { IndexedNode } from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import {
  type SearchResult,
  type SearchResults,
  useSearch,
} from "hooks/useSearch";
import { debounce } from "lodash";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useMemo, useState } from "react";
import { Components, Virtuoso } from "react-virtuoso";

import { ExternalPortalList } from "./ExternalPortalList";
import { ALL_FACETS, SearchFacets } from "./facets";
import { SearchHeader } from "./SearchHeader";
import { SearchResultCard } from "./SearchResultCard";

const DEBOUNCE_MS = 500;

interface SearchNodes {
  pattern: string;
  facets: SearchFacets;
}

// Types for Virtuoso
export type Data = SearchResult<IndexedNode>;
export type Context = {
  results: SearchResults<IndexedNode>;
  formik: ReturnType<typeof useFormik<SearchNodes>>;
  isSearching: boolean;
  lastPattern: string;
  setIsSearching: React.Dispatch<React.SetStateAction<boolean>>;
};

/**
 * Accessibility - Render the Virtuoso list as a HTMLUListElement, not a HTMLDivElement
 */
const ListComponent = React.forwardRef<HTMLUListElement>((props, ref) => (
  <List {...props} ref={ref} sx={{ mx: 3 }} />
)) as Components<Data, Context>["List"];

/**
 * Accessibility - Render the Virtuoso item as a HTMLLiElement, not a HTMLDivElement
 */
const ListItemComponent = React.forwardRef<HTMLLIElement>((props, ref) => (
  <ListItem disablePadding sx={{ pb: 2 }} {...props} ref={ref} />
)) as Components<Data, Context>["Item"];

/**
 * Search uses Virtuoso to generate a virtualised list of search results
 */
const Search: React.FC = () => {
  // Get ordered flow of indexed nodes from store
  const [orderedFlow, setOrderedFlow] = useStore((state) => [
    state.orderedFlow,
    state.setOrderedFlow,
  ]);

  useEffect(() => {
    if (!orderedFlow) setOrderedFlow();
  }, [orderedFlow, setOrderedFlow]);

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
  const { results, search } = useSearch({
    list: orderedFlow || [],
    keys: formik.values.facets,
  });

  const debouncedSearch = useMemo(
    () =>
      debounce((pattern: string) => {
        console.debug("Search term: ", pattern);
        search(pattern);
        setLastPattern(pattern);
        setIsSearching(false);
      }, DEBOUNCE_MS),
    [search],
  );

  return (
    <Virtuoso<Data, Context>
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
