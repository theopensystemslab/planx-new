import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import { get, isEmpty, omit } from "lodash";
import React, { useEffect, useState } from "react";
import { useCurrentRoute, useNavigation } from "react-navi";
import { Paths } from "type-fest";
import { slugify } from "utils";

import { FiltersColumn } from "./FiltersColumn";
import { FiltersContent } from "./FilterStyles";
import { addToSearchParams, clearSearchParams } from "./searchParamUtils";

export type FilterKey<T> = Paths<T>;
export type FilterValues = string;
export type Filters<T> = {
  [K in keyof T]: T[K];
};

export interface FilterOptions<T> {
  /** displayName is a string used to group to options in the UI */
  displayName: string;
  /** optionKey is what is passed in to filter the records */
  optionKey: FilterKey<T>;
  /** optionValue is displayed under displayName for selecting filters and can be used for filtering */
  optionValue: FilterValues[];
  /** the function passed into the filter to determine if it should be included or excluded */
  validationFn: (option: T, value?: FilterValues) => boolean;
}

interface FiltersProps<T> {
  /** an array of objects to filter */
  records: T[];
  /** A way to set the new filtered order of the array */
  setFilteredRecords: React.Dispatch<React.SetStateAction<T[] | null>>;
  /** An array of objects to define how to filter the records - the FilterOptions type has more information */
  filterOptions: FilterOptions<T>[];
  clearFilters?: boolean;
}

/**
 * Renders a drop-down accordion displaying lists of grouped checkboxes for filtering records
 * @example
 * <Filters<FlowSummary>
 *   records={flows}
 *   setFilteredRecords={setFilteredFlows}
 *   filterOptions={filterOptions}
 * />
 */

export const Filters = <T extends object>({
  records,
  setFilteredRecords,
  filterOptions,
  clearFilters = false,
}: FiltersProps<T>) => {
  const [optionsToFilter] = useState(filterOptions);

  const navigation = useNavigation();
  const route = useCurrentRoute();

  const { values, setFieldValue, submitForm, resetForm } = useFormik<{
    filters: Filters<T> | null;
  }>({
    initialValues: { filters: null },
    onSubmit: ({ filters }) => {
      if (!filters && records) {
        clearSearchParams<T>(route.url.search, optionsToFilter, navigation);
        setFilteredRecords(records);
      }
      if (filters) {
        addToSearchParams<T>(
          filters,
          route.url.search,
          optionsToFilter,
          navigation,
        );
        const filteredRecords = records.filter((record: T) => {
          return optionsToFilter.every((value: FilterOptions<T>) => {
            const valueToFilter = get(filters, value.optionKey);

            return valueToFilter
              ? value.validationFn(record, valueToFilter)
              : true;
          });
        });
        setFilteredRecords(filteredRecords);
      }
    },
  });

  const findFiltersFromSearchParams = ([displayName, optionValue]: [
    FilterKey<T>,
    FilterValues,
  ]) => {
    const findOption = optionsToFilter.find(
      (option) => slugify(`${option.displayName}`) === `${displayName}`,
    );
    return (
      findOption &&
      ({ [`${findOption.optionKey}`]: `${optionValue}` } as
        | Filters<T>
        | undefined)
    );
  };

  useEffect(() => {
    const parseStateFromURL = () => {
      const searchParams = new URLSearchParams(route.url.search);
      const searchParamToMap = Array.from(searchParams.entries()) as [
        FilterKey<T>,
        FilterValues,
      ][];

      const searchParamFilters = searchParamToMap
        .map(findFiltersFromSearchParams)
        .filter((result) => result !== undefined);

      let filtersToApply: Filters<T> | null = null;

      searchParamFilters.forEach((param) => {
        if (param) {
          // map method above ensures we create an array of type Filters<T>
          const filterParam = param;
          filtersToApply = { ...filtersToApply, ...filterParam };
        }
      });
      !isEmpty(filtersToApply) && setFieldValue("filters", filtersToApply);
    };

    if (!values.filters) {
      parseStateFromURL();
      setFilteredRecords(records);
    }
  }, []);

  useEffect(() => {
    if (values.filters || records) {
      submitForm();
    }
  }, [submitForm, values.filters, records]);

  useEffect(() => {
    if (clearFilters) {
      resetForm();
      submitForm();
    }
  }, [clearFilters, resetForm, submitForm]);

  const handleChange = (filterKey: FilterKey<T>, filterValue: FilterValues) => {
    const newObject = {
      ...values.filters,
      [filterKey]: filterValue,
    } as Filters<T>;

    get(values.filters, filterKey) === filterValue
      ? removeFilter(filterKey)
      : setFieldValue("filters", newObject);
  };

  const removeFilter = (targetFilter: FilterKey<T>) => {
    const newFilters = omit(values.filters, targetFilter) as Filters<T>;
    setFieldValue("filters", newFilters);
  };

  return (
    <FiltersContent>
      <Box
        component="form"
        name="filters"
        aria-label="Filter options"
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <Typography variant="body2" sx={{ width: "70px" }}>
          <strong>Filter by</strong>
        </Typography>
        {optionsToFilter.map((option) => (
          <fieldset
            key={option.displayName}
            aria-describedby={`${option.displayName}-description`}
            style={{ flexBasis: "175px", flexShrink: 0, margin: 0 }}
          >
            <div
              key={`${option.displayName}-description`}
              id={`${option.displayName}-description`}
              hidden
            >
              Select options to filter the list by {option.displayName}
            </div>

            <FiltersColumn
              key={`${option.displayName}-filter-column`}
              title={option.displayName}
              optionKey={option.optionKey}
              optionValues={option.optionValue}
              filters={values.filters}
              handleChange={handleChange}
              name={option.displayName}
            />
          </fieldset>
        ))}
      </Box>
    </FiltersContent>
  );
};

export default Filters;
