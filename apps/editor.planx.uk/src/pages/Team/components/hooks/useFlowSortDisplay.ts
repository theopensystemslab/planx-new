import { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import { useCurrentRoute } from "react-navi";
import { getSortParams } from "ui/editor/SortControl/utils";

import { sortOptions } from "../../helpers/sortAndFilterOptions";

/**
 * Hook to determine whether to display "Last published" or "Last edited"
 * based on the current sort parameters
 */
export const useFlowSortDisplay = () => {
  const route = useCurrentRoute();

  const {
    sortObject: { displayName: sortDisplayName },
  } = getSortParams<FlowSummary>(route.url.query, sortOptions);

  const showPublished = sortDisplayName?.toLowerCase().includes("publish");
  const headerText = showPublished ? "Last published" : "Last edited";

  return {
    showPublished,
    headerText,
    sortDisplayName,
  };
};
