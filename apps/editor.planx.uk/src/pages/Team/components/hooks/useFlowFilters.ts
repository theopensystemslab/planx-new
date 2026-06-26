import { useSearch } from "@tanstack/react-router";
import { orderBy } from "lodash";
import { FilterOptions } from "ui/editor/Filter/Filter";
import { SortableFields } from "ui/editor/SortControl/SortControl";
import { getSortParams } from "ui/editor/SortControl/utils";
import { slugify } from "utils";

import { FlowSummary } from "../../../FlowEditor/lib/store/editor";

interface UseFlowFiltersProps {
  flows: FlowSummary[] | null;
  filterOptions: FilterOptions<FlowSummary>[];
  sortOptions: SortableFields<FlowSummary>[];
}

interface UseFlowFiltersResult {
  sortedFlows: FlowSummary[] | null;
  flowsHaveBeenFiltered: boolean;
}

/**
 * Applies the URL-driven filter params to filter and sort a list of flows
 *
 * Each filter is expressed as a `validationFn` (`FilterOptions<T>`), which
 * this hook then runs generically.
 */
export const useFlowFilters = ({
  flows,
  filterOptions,
  sortOptions,
}: UseFlowFiltersProps): UseFlowFiltersResult => {
  const searchParams = useSearch({ from: "/_authenticated/app/$team/" });

  if (!flows) return { sortedFlows: null, flowsHaveBeenFiltered: false };

  let result = [...flows];

  for (const option of filterOptions) {
    const paramKey = option.paramKey ?? slugify(option.displayName);
    const paramValue = searchParams[paramKey as keyof typeof searchParams];

    if (paramValue) {
      result = result.filter((flow) => option.validationFn(flow, paramValue));
    }
  }

  const { sortObject, sortDirection } = getSortParams(
    searchParams,
    sortOptions,
  );
  result = orderBy(result, sortObject.fieldName, sortDirection);

  return {
    sortedFlows: result,
    flowsHaveBeenFiltered: result.length !== flows.length,
  };
};
