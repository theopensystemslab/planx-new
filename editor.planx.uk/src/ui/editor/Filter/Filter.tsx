import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { capitalize, findKey, get, isEmpty, omit } from "lodash";
import React, { useEffect, useState } from "react";
import { useCurrentRoute, useNavigation } from "react-navi";
import { Paths, ValueOf } from "type-fest";
import { slugify } from "utils";

import { FiltersColumn } from "./FiltersColumn";
import {
  FiltersBody,
  FiltersContainer,
  FiltersContent,
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
  /** displayName is a string used to group to options in the UI */
  displayName: string;
  /** optionKey is what is passed in to filter the records */
  optionKey: FilterKey<T>;
  /** optionValue is displayed under displayName for selecting filters and can be used for filtering */
  optionValue: FilterValues<T>[];
  /** the function passed into the filter to determine if it should be included or excluded */
  validationFn: (option: T, value?: FilterValues<T>) => boolean;
}

interface FiltersProps<T> {
  records: T[];
  setFilteredRecords: React.Dispatch<React.SetStateAction<T[] | null>>;
  filterOptions: FilterOptions<T>[];
  clearFilters?: boolean;
}

/**
 * @component
 * @description Filters a list of records
 * @param {Type} T - a type to define the shape of the data in the records array
 * @param {Array} props.records - an array of objects to filter
 * @param {Function} props.setFilteredRecords - A way to set the new filtered order of the array
 * @param {Array} props.filterOptions - An array of objects to define how to filter the records - the FilterOptions type has more information
 * @returns {JSX.Element} A drop-down accordion displaying lists of grouped checkboxes
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
}: FiltersProps<T>) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters<T> | null>(null);
  const [optionsToFilter] = useState(filterOptions);

  const navigation = useNavigation();
  const route = useCurrentRoute();

  useEffect(() => {
    const parseStateFromURL = () => {
      const searchParams = new URLSearchParams(route.url.search);
      const searchParamToMap = searchParams.entries().toArray() as [
        FilterKey<T>,
        FilterValues<T>,
      ][];

      const searchParamFilters = searchParamToMap
        .map((key) => {
          const findOption = optionsToFilter.find(
            (option) => slugify(`${option.displayName}`) === `${key[0]}`,
          );
          return findOption && { [`${findOption.optionKey}`]: `${key[1]}` };
        })
        .filter((result) => result !== undefined);

      let filtersToApply: Filters<T> | null = null;

      searchParamFilters.forEach((param) => {
        // map method above ensures we create an array of type Filters<T>
        const filterParam = param as Filters<T>;
        filtersToApply = { ...filtersToApply, ...filterParam };
      });
      !isEmpty(filtersToApply) && setFilters(filtersToApply);
    };

    if (filters === null) {
      parseStateFromURL();
    }
  });

  useEffect(() => {
    if (!filters && records) {
      setFilteredRecords(records);
    } else {
      const filteredRecords = records.filter((record: T) => {
        return optionsToFilter.every((value: FilterOptions<T>) => {
          const valueToFilter = get(filters, value.optionKey);
          if (valueToFilter) {
            return value.validationFn(record, valueToFilter);
          }
          return true;
        });
      });
      setFilteredRecords(filteredRecords);
    }
  }, [filters, setFilteredRecords, records, optionsToFilter]);

  useEffect(() => {
    const addToSearchParams = (params: Filters<T>) => {
      const searchParams = new URLSearchParams(route.url.search);
      const mappedFilters = mapFilters(params, optionsToFilter);
      mappedFilters && addFilterSearchParam<T>(searchParams, mappedFilters);
      removeUnusedFilterSearchParam<T>(
        optionsToFilter,
        searchParams,
        mappedFilters || [],
      );
      updateUrl(navigation, searchParams);
    };

    const clearSearchParams = () => {
      const searchParams = new URLSearchParams(route.url.search);
      const displayNames = optionsToFilter.map((option) => option.displayName);
      displayNames.forEach((name) => {
        searchParams.delete(slugify(name));
      });

      updateUrl(navigation, searchParams);
    };

    filters ? addToSearchParams(filters) : clearSearchParams();
  }, [filters, optionsToFilter, navigation, route.url.search]);

  const handleChange = (
    filterKey: FilterKey<T>,
    filterValue: FilterValues<T>,
  ) => {
    const newObject = {
      ...filters,
      [filterKey]: filterValue,
    } as Filters<T>;
    get(filters, filterKey) === filterValue
      ? removeFilter(filterKey)
      : setFilters(newObject);
  };

  const removeFilter = (targetFilter: FilterKey<T>) => {
    const newFilters = omit(filters, targetFilter) as Filters<T>;
    setFilters(newFilters);
  };

  return (
    <FiltersContainer
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
    >
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
          {filters &&
            Object.entries(filters).map(([_key, value]) => {
              if (!value) return;
              return (
                <StyledChip
                  onClick={(e) => e.stopPropagation()}
                  label={capitalize(`${value}`)}
                  key={`${value}`}
                  onDelete={() => {
                    const targetKey = findKey(
                      filters,
                      (keys) => keys === value,
                    ) as FilterKey<T>;
                    removeFilter(targetKey);
                  }}
                />
              );
            })}
        </Box>
      </FiltersHeader>
      <FiltersBody>
        <FiltersContent>
          {optionsToFilter.map((option) => (
            <FiltersColumn
              key={`${option.displayName}-filter-column`}
              title={option.displayName}
              optionKey={option.optionKey}
              optionValues={option.optionValue}
              filters={filters}
              handleChange={handleChange}
            />
          ))}
        </FiltersContent>
      </FiltersBody>
    </FiltersContainer>
  );
};

export default Filters;
