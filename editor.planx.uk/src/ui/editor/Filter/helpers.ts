import { FormikProps } from "formik";
import { omit } from "lodash";
import { slugify } from "utils";

import Filters, { FilterKey, FilterOptions, FilterValues } from "./Filter";

export interface MappedFilters<T> {
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
