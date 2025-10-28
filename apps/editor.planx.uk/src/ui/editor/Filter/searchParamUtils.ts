import { NavigateOptions } from "@tanstack/react-router";
import { slugify } from "utils";

import Filters, { FilterOptions } from "./Filter";
import { mapFilters } from "./helpers";

export const updateSearchParams = <T extends object>(
  filters: Filters<T> | null,
  optionsToFilter: FilterOptions<T>[],
  navigate: (opts: NavigateOptions) => void,
) => {
  const displayNames = optionsToFilter.map((option) => option.displayName);

  if (!filters) {
    // Clear all filter params
    const updates = Object.fromEntries(
      displayNames.map((name) => [slugify(name), undefined]),
    );

    navigate({
      search: (prev) => ({ ...prev, ...updates }),
      replace: true,
    });
    return;
  }

  // Map filters to search params
  const mappedFilters = mapFilters(filters, optionsToFilter);
  const updates: Record<string, string | undefined> = {};

  // Set active filter values
  if (mappedFilters) {
    mappedFilters.forEach((filter) => {
      updates[filter.displayName] =
        filter.filterValue === "" ? undefined : filter.filterValue;
    });
  }

  // Clear unused filter params
  displayNames.forEach((name) => {
    const slugifiedName = slugify(name);
    const hasValue = mappedFilters?.some(
      (filter) => filter.displayName === slugifiedName,
    );
    if (!hasValue) {
      updates[slugifiedName] = undefined;
    }
  });

  navigate({
    search: (prev) => ({ ...prev, ...updates }),
    replace: true,
  });
};
