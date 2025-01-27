import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import { capitalize, findKey, get, isEmpty, map, omit } from "lodash";
import React, { useEffect, useState } from "react";
import { useCurrentRoute, useNavigation } from "react-navi";
import { Paths, ValueOf } from "type-fest";
import { slugify } from "utils";

import { FiltersColumn } from "./FiltersColumn";
import {
  FiltersBody,
  FiltersContainer,
  FiltersContent,
  FiltersFooter,
  FiltersHeader,
  FiltersToggle,
  StyledChip,
} from "./FilterStyles";
import { mapFilters } from "./helpers";
import {
  addFilterSearchParam,
  removeUnusedFilterSearchParam,
  updateUrl,
} from "./searchParamUtils";

export type FilterKey<T> = Paths<T>;
export type FilterValues<T> = ValueOf<T>;
export type Filters<T> = {
  [K in keyof T]: T[K];
};

export interface FilterOptions<T> {
  displayName: string;
  optionKey: FilterKey<T>;
  optionValue: FilterValues<T>[];
  validationFn: (option: T, value?: FilterValues<T>) => boolean;
}

interface FiltersProps<T> {
  records: T[];
  setFilteredRecords: React.Dispatch<React.SetStateAction<T[] | null>>;
  filterOptions: FilterOptions<T>[];
  clearFilters?: boolean;
}

interface FormikFilterProps<T> {
  filters: Filters<T> | null;
  selectedFilters: Filters<T> | null;
}

export const Filters = <T extends object>({
  records,
  setFilteredRecords,
  filterOptions,
  clearFilters,
}: FiltersProps<T>) => {
  const [originalRecords] = useState<T[]>(records);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [haveFiltersChanged, setHaveFiltersChanged] = useState<boolean>(false);

  const { values, setFieldValue, handleSubmit, resetForm } = useFormik<
    FormikFilterProps<T>
  >({
    initialValues: { filters: null, selectedFilters: null },
    onSubmit: ({ selectedFilters }) => handleFiltering(selectedFilters),
  });

  const navigation = useNavigation();
  const route = useCurrentRoute();

  const addToSearchParams = (params: Filters<T>) => {
    const searchParams = new URLSearchParams(route.url.search);
    if (params) {
      const mappedFilters = mapFilters(params, filterOptions);
      addFilterSearchParam<T>(searchParams, mappedFilters);
      removeUnusedFilterSearchParam<T>(
        filterOptions,
        searchParams,
        mappedFilters,
      );
      updateUrl(navigation, searchParams);
    }
  };

  const clearSearchParams = () => {
    const searchParams = new URLSearchParams(route.url.search);
    const displayNames = filterOptions.map((option) => option.displayName);
    displayNames.forEach((name) => {
      searchParams.delete(slugify(name));
    });

    updateUrl(navigation, searchParams);
  };

  const parseStateFromURL = () => {
    const searchParams = new URLSearchParams(route.url.search);
    const searchParamToMap = searchParams.entries().toArray() as [
      FilterKey<T>,
      FilterValues<T>,
    ][];

    const searchParamFilters = searchParamToMap
      .map((key) => {
        const findOption = filterOptions.find(
          (option) => slugify(`${option.displayName}`) === `${key[0]}`,
        );
        return findOption && { [`${findOption.optionKey}`]: `${key[1]}` };
      })
      .filter((result) => result !== undefined);

    searchParamFilters.forEach((param) =>
      setFieldValue("selectedFilters", param),
    );
  };

  useEffect(() => {
    parseStateFromURL();
  }, []);

  useEffect(() => {
    handleSubmit();
  }, [values, handleSubmit]);

  useEffect(() => {
    resetForm();
  }, [resetForm, clearFilters]);

  const handleFiltering = (collectedFilters: Filters<T> | null) => {
    if (!collectedFilters && originalRecords)
      return setFilteredRecords(originalRecords);
    const filteredRecords = originalRecords.filter((record: T) => {
      return filterOptions.every((value: FilterOptions<T>) => {
        const valueToFilter = get(collectedFilters, value.optionKey);
        if (valueToFilter) {
          return value.validationFn(record, valueToFilter);
        }
        return true;
      });
    });
    setFilteredRecords(filteredRecords);
  };

  const handleChange = (
    filterKey: FilterKey<T>,
    filterValue: FilterValues<T>,
  ) => {
    const newObject = {
      ...values.filters,
      [filterKey]: filterValue,
    } as Filters<T>;
    get(values.filters, filterKey) === filterValue
      ? removeFilter(filterKey)
      : setFieldValue("filters", newObject);
    setHaveFiltersChanged(true);
  };

  const removeFilter = (targetFilter: FilterKey<T>) => {
    const newFilters = omit(values.filters, targetFilter) as Filters<T>;
    setFieldValue("filters", newFilters);
  };

  const removeSelectedFilter = (targetFilter: FilterKey<T>) => {
    const newFilters = omit(
      values.selectedFilters,
      targetFilter,
    ) as Filters<T> | null;
    if (!isEmpty(newFilters)) {
      updateFilterState(newFilters);
      handleSubmit();
    }
    if (isEmpty(newFilters)) {
      resetForm();
      handleSubmit();
      clearSearchParams();
    }
  };

  const updateFilterState = (newFilters: Filters<T> | null) => {
    setFieldValue("selectedFilters", newFilters);
    setFieldValue("filters", newFilters);
    isEmpty(newFilters) && !newFilters
      ? clearSearchParams()
      : addToSearchParams(newFilters);
  };

  return (
    <FiltersContainer
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
    >
      <form onSubmit={() => handleSubmit()}>
        <fieldset>
          <FiltersHeader
            expandIcon={
              expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />
            }
          >
            <FiltersToggle>
              {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              <Typography variant="h4">
                {expanded ? "Hide filters" : "Show filters"}
              </Typography>
            </FiltersToggle>
            <Box sx={{ display: "flex", gap: 1 }}>
              {values.selectedFilters &&
                Object.entries(values.selectedFilters).map(([_key, value]) => {
                  if (!value) return;
                  return (
                    <StyledChip
                      onClick={(e) => e.stopPropagation()}
                      label={capitalize(`${value}`)}
                      key={`${value}`}
                      onDelete={() => {
                        const targetKey = findKey(
                          values.selectedFilters,
                          (keys) => keys === value,
                        ) as FilterKey<T>;
                        removeSelectedFilter(targetKey);
                      }}
                    />
                  );
                })}
            </Box>
          </FiltersHeader>
          <FiltersBody>
            <FiltersContent>
              {filterOptions.map((option) => (
                <FiltersColumn
                  key={`${option.displayName}-filter-column`}
                  title={option.displayName}
                  optionKey={option.optionKey}
                  optionValues={option.optionValue}
                  filters={values.filters}
                  handleChange={handleChange}
                />
              ))}
            </FiltersContent>
            <FiltersFooter>
              <Button
                variant="contained"
                color="primary"
                disabled={!haveFiltersChanged}
                onClick={() => {
                  updateFilterState(values.filters);
                  handleSubmit();
                  setHaveFiltersChanged(false);
                }}
              >
                Apply filters
              </Button>
            </FiltersFooter>
          </FiltersBody>
        </fieldset>
      </form>
    </FiltersContainer>
  );
};

export default Filters;
