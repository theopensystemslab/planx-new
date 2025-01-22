import { slugify } from "utils";

import Filters, { FilterKey, FilterOptions, FilterValues } from "./Filter";

interface MappedFilters<T> {
  displayName: string;
  filterValue: FilterValues<T>;
}

export const mapFilters = <T extends object>(
  params: Filters<T> | {},
  filterOptions: FilterOptions<T>[],
) => {
  const filtersToMap = Object.entries(params) as [
    FilterKey<T>,
    FilterValues<T>,
  ][];

  const mappedArrayFilters = filtersToMap.map(([key, value]) =>
    addDisplayNamesToFilters(key, value, filterOptions),
  );

  return mappedArrayFilters;
};

export const addDisplayNamesToFilters = <T extends object>(
  key: FilterKey<T>,
  value: FilterValues<T>,
  filterOptions: FilterOptions<T>[],
) => {
  const matchingFilterOption = filterOptions.find(
    (option) => option.optionKey === key,
  );

  const newMappedFilterOptions = {
    displayName: slugify(`${matchingFilterOption?.displayName}`),
    filterValue: value,
  };

  return newMappedFilterOptions;
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
  mappedFilters: MappedFilters<T>[],
) => {
  const displayNames = filterOptions.map((option) => option.displayName);
  displayNames.map((name) => {
    const paramToDelete = mappedFilters.find(
      (filter) => filter.displayName === slugify(name),
    );
    !paramToDelete && searchParams.delete(slugify(name));
  });
};
