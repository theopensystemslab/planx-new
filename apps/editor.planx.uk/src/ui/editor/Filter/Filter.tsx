import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useNavigate, useSearch } from "@tanstack/react-router";
import React from "react";
import { Paths } from "type-fest";
import { slugify } from "utils";

import { FiltersColumn } from "./FiltersColumn";
import { FiltersContent } from "./FilterStyles";

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
  /** optional override for the URL search param key (defaults to slugified displayName) */
  paramKey?: string;
}

interface FiltersProps<T> {
  /** An array of objects to define how to filter the records - the FilterOptions type has more information */
  filterOptions: FilterOptions<T>[];
}

/**
 * Renders a drop-down accordion displaying lists of grouped checkboxes for filtering records
 * @example
 * <Filters<FlowSummary>
 *   filterOptions={filterOptions}
 * />
 */

export const Filters = <T extends object>({
  filterOptions,
}: FiltersProps<T>) => {
  const navigate = useNavigate();
  const searchParams = useSearch({ from: "/_authenticated/app/$team/" });

  // Get current filter values from URL
  const getCurrentFilterValues = (): Filters<T> | null => {
    const activeFilters: Partial<Record<FilterKey<T>, FilterValues>> = {};
    let hasFilters = false;

    filterOptions.forEach((option) => {
      const paramKey = option.paramKey || slugify(option.displayName);
      const paramValue = searchParams[paramKey as keyof typeof searchParams];

      if (paramValue && typeof paramValue === "string") {
        activeFilters[option.optionKey] = paramValue;
        hasFilters = true;
      }
    });

    return hasFilters ? (activeFilters as Filters<T>) : null;
  };

  const currentFilters = getCurrentFilterValues();

  const handleChange = (filterKey: FilterKey<T>, filterValue: FilterValues) => {
    const filterOption = filterOptions.find(
      (opt) => opt.optionKey === filterKey,
    );
    if (!filterOption) return;

    const paramKey = filterOption.paramKey || slugify(filterOption.displayName);
    const currentValue = searchParams[paramKey as keyof typeof searchParams];

    // Toggle filter: if same value, remove it; otherwise set it
    const newValue = currentValue === filterValue ? undefined : filterValue;

    navigate({
      to: ".",
      search: (prev) => ({
        ...prev,
        [paramKey]: newValue,
      }),
      replace: true,
    });
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
        {filterOptions.map((option) => (
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
              filters={currentFilters}
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
