import { useSearch } from "@tanstack/react-router";
import { useSearch as useFuseSearch } from "hooks/useSearch";
import { orderBy } from "lodash";
import { useEffect, useMemo } from "react";
import type { FilterOptions } from "ui/editor/Filter/Filter";
import type { SortableFields } from "ui/editor/SortControl/SortControl";
import { getSortParams } from "ui/editor/SortControl/utils";
import { slugify } from "utils";

import type { FlowSummary } from "../../../FlowEditor/lib/store/editor";

interface UseDisplayedFlowsProps {
  flows: FlowSummary[] | null;
  sortOptions: SortableFields<FlowSummary>[];
  /** Optional - not all pages (e.g. Archive) have filters */
  filterOptions?: FilterOptions<FlowSummary>[];
}

interface UseDisplayedFlowsResult {
  displayedFlows: FlowSummary[] | null;
  /** Is the returned list narrowed via searching or filtering */
  isFiltered: boolean;
}

const SEARCH_KEYS: Array<keyof FlowSummary> = ["name", "slug"];

/**
 * Shared logic to determine which flows to display to a user (and how)
 *
 * Driven by URL params, it applies search → filter → sort operations
 */
export const useDisplayedFlows = ({
  flows,
  sortOptions,
  filterOptions = [],
}: UseDisplayedFlowsProps): UseDisplayedFlowsResult => {
  const searchParams = useSearch({ from: "/_authenticated/app/$team/flows" });

  const searchList = useMemo(() => flows ?? [], [flows]);

  const { results, search } = useFuseSearch({
    list: searchList,
    keys: SEARCH_KEYS,
    searchType: "include-match",
  });

  useEffect(() => {
    search(searchParams.search ?? "");
  }, [searchParams.search, search]);

  if (!flows) return { displayedFlows: null, isFiltered: false };

  // 1. Search
  let result = searchParams.search ? results.map((r) => r.item) : [...flows];

  // 2. Filter
  for (const option of filterOptions) {
    const paramKey = option.paramKey ?? slugify(option.displayName);
    const paramValue = searchParams[paramKey as keyof typeof searchParams] as
      | string
      | undefined;
    if (paramValue) {
      result = result.filter((flow) => option.validationFn(flow, paramValue));
    }
  }

  // 3. Sort
  const { sortObject, sortDirection } = getSortParams(
    searchParams,
    sortOptions,
  );
  result = orderBy(result, sortObject.fieldName, sortDirection);

  return {
    displayedFlows: result,
    isFiltered: result.length !== flows.length,
  };
};
