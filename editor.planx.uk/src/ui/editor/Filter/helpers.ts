import { slugify } from "utils";

import Filters, { FilterKey, FilterOptions, FilterValues } from "./Filter";

export interface MappedFilters {
  displayName: string;
  filterValue: FilterValues;
}

export const mapFilters = <T extends object>(
  params: Filters<T> | null,
  filterOptions: FilterOptions<T>[],
) => {
  const filtersToMap =
    params && (Object.entries(params) as [FilterKey<T>, FilterValues][]);

  if (filtersToMap) {
    const mappedArrayFilters = filtersToMap.map(([key, value]) =>
      addDisplayNamesToFilters(key, value, filterOptions),
    );

    return mappedArrayFilters;
  }
};

export const addDisplayNamesToFilters = <T extends object>(
  key: FilterKey<T>,
  value: FilterValues,
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
