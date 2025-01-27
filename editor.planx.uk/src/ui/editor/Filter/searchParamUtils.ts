import { Navigation } from "navi";
import { slugify } from "utils";

import { FilterOptions } from "./Filter";
import { MappedFilters } from "./helpers";

export const updateUrl = (
  navigation: Navigation<any>,
  searchParams: URLSearchParams,
) => {
  navigation.navigate(
    {
      pathname: window.location.pathname,
      search: searchParams.toString(),
    },
    {
      replace: true,
    },
  );
};

export const addFilterSearchParam = <T extends object>(
  searchParams: URLSearchParams,
  mappedFilters: MappedFilters<T>[],
) => {
  mappedFilters.forEach((filter) =>
    searchParams.set(filter.displayName, `${filter.filterValue}`),
  );
};

export const removeUnusedFilterSearchParam = <T extends object>(
  filterOptions: FilterOptions<T>[],
  searchParams: URLSearchParams,
  mappedFilters: MappedFilters<T>[] | [],
) => {
  const displayNames = filterOptions.map((option) => option.displayName);
  displayNames.map((name) => {
    const paramToDelete = mappedFilters.find(
      (filter) => filter.displayName === slugify(name),
    );
    !paramToDelete && searchParams.delete(slugify(name));
  });
};
