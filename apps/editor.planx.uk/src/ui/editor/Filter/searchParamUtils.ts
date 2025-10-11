import { Navigation } from "navi";
import { slugify } from "utils";

import Filters, { FilterOptions } from "./Filter";
import { mapFilters, MappedFilters } from "./helpers";

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

export const addFilterSearchParam = (
  searchParams: URLSearchParams,
  mappedFilters: MappedFilters[],
) => {
  mappedFilters.forEach((filter) =>
    searchParams.set(filter.displayName, `${filter.filterValue}`),
  );
};

export const removeUnusedFilterSearchParam = <T extends object>(
  filterOptions: FilterOptions<T>[],
  searchParams: URLSearchParams,
  mappedFilters: MappedFilters[] | [],
) => {
  const displayNames = filterOptions.map((option) => option.displayName);
  displayNames.map((name) => {
    const paramToDelete = mappedFilters.find(
      (filter) => filter.displayName === slugify(name),
    );
    !paramToDelete && searchParams.delete(slugify(name));
  });
};

export const addToSearchParams = <T extends object>(
  params: Filters<T>,
  url: string,
  optionsToFilter: FilterOptions<T>[],
  navigation: Navigation<any>,
) => {
  const searchParams = new URLSearchParams(url);
  const mappedFilters = mapFilters(params, optionsToFilter);

  mappedFilters && addFilterSearchParam(searchParams, mappedFilters);

  removeUnusedFilterSearchParam<T>(
    optionsToFilter,
    searchParams,
    mappedFilters || [],
  );

  updateUrl(navigation, searchParams);
};

export const clearSearchParams = <T extends object>(
  url: string,
  optionsToFilter: FilterOptions<T>[],
  navigation: Navigation<any>,
) => {
  const searchParams = new URLSearchParams(url);
  const displayNames = optionsToFilter.map((option) => option.displayName);
  displayNames.forEach((name) => {
    searchParams.delete(slugify(name));
  });

  updateUrl(navigation, searchParams);
};
