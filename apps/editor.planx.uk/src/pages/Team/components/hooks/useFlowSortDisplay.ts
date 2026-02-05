import { useSearch } from "@tanstack/react-router";
import { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import { getSortParams } from "ui/editor/SortControl/utils";

import { sortOptions } from "../../helpers/sortAndFilterOptions";

/**
 * Hook to determine whether to display "Last published" or "Last edited"
 * based on the current sort parameters
 */
export const useFlowSortDisplay = () => {
  const searchParams = useSearch({ from: "/_authenticated/app/$team/" });

  const {
    sortObject: { displayName: sortDisplayName },
  } = getSortParams<FlowSummary>(searchParams, sortOptions);

  const showPublished = sortDisplayName?.toLowerCase().includes("publish");
  const headerText = showPublished ? "Last published" : "Last edited";

  return {
    showPublished,
    headerText,
    sortDisplayName,
  };
};
