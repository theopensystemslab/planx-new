import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Accordion, { accordionClasses } from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary, {
  accordionSummaryClasses,
} from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import {
  __,
  capitalize,
  filter,
  findKey,
  get,
  isEmpty,
  map,
  omit,
} from "lodash";
import React, { useEffect, useState } from "react";
import { useCurrentRoute, useNavigation } from "react-navi";
import { Paths, ValueOf } from "type-fest";
import { slugify } from "utils";

import { FiltersColumn } from "./FiltersColumn";
import { mapFilters } from "./helpers";
import {
  addFilterSearchParam,
  removeUnusedFilterSearchParam,
  updateUrl,
} from "./searchParamUtils";

const FiltersContainer = styled(Accordion)(({ theme }) => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  margin: theme.spacing(1, 0, 3),
  border: `1px solid ${theme.palette.border.main}`,
  [`&.${accordionClasses.root}.Mui-expanded`]: {
    margin: theme.spacing(1, 0, 3),
  },
  [`& .${accordionSummaryClasses.root} > div`]: {
    margin: "0",
  },
}));

const FiltersHeader = styled(AccordionSummary)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(1.75, 2),
  gap: theme.spacing(3),
  background: theme.palette.background.default,
  "&:hover": {
    background: theme.palette.background.default,
  },
  "& .MuiAccordionSummary-expandIconWrapper": {
    display: "none",
  },
}));

const FiltersToggle = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  minWidth: "160px",
  minHeight: "32px",
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  background: theme.palette.common.white,
  cursor: "default",
  textTransform: "capitalize",
  "& > svg": {
    fill: theme.palette.text.secondary,
  },
  "&:hover": {
    background: theme.palette.common.white,
    "& > svg": {
      fill: theme.palette.text.primary,
    },
  },
}));

const FiltersBody = styled(AccordionDetails)(({ theme }) => ({
  background: theme.palette.background.default,
  padding: 0,
}));

const FiltersContent = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.border.main}`,
  padding: theme.spacing(2.5, 2.5, 2, 2.5),
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
}));

const FiltersFooter = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.border.main}`,
  padding: theme.spacing(1.5, 2),
}));

export type FilterKey<T> = Paths<T>;
export type FilterValues<T> = ValueOf<T>;
export type Filters<T> = {
  [K in keyof T]: T[K];
};

export interface FilterOptions<T> {
  displayName: string;
  optionKey: FilterKey<T>;
  optionValue: FilterValues<T>[];
  validationFn: (option: T, value: unknown) => boolean;
}

interface FiltersProps<T> {
  records: T[];
  setFilteredRecords: React.Dispatch<React.SetStateAction<T[] | null>>;
  filterOptions: FilterOptions<T>[];
  clearFilters?: boolean;
}

export const Filters = <T extends object>({
  records,
  setFilteredRecords,
  filterOptions,
  clearFilters,
}: FiltersProps<T>) => {
  const [filters, setFilters] = useState<Filters<T> | {}>();
  const [selectedFilters, setSelectedFilters] = useState<Filters<T> | {}>();
  const [originalRecords, setOriginalRecords] = useState<T[]>();
  const [expanded, setExpanded] = useState<boolean>(false);

  const navigation = useNavigation();
  const route = useCurrentRoute();

  const addToSearchParams = (params: Filters<T> | {}) => {
    const searchParams = new URLSearchParams(route.url.search);
    const mappedFilters = mapFilters(params, filterOptions);
    addFilterSearchParam<T>(searchParams, mappedFilters);
    removeUnusedFilterSearchParam<T>(
      filterOptions,
      searchParams,
      mappedFilters,
    );

    updateUrl(navigation, searchParams);
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

    const searchParamFilters = searchParamToMap.map((key) => {
      const findOption = filterOptions.find(
        (option) => slugify(`${option.displayName}`) === `${key[0]}`,
      );
      return findOption && { [`${findOption.optionKey}`]: `${key[1]}` };
    });

    const paramFilters = {};

    searchParamFilters.forEach((param) => Object.assign(paramFilters, param));

    !isEmpty(paramFilters) && updateFilterState(paramFilters);
  };

  useEffect(() => {
    setOriginalRecords(records);
  }, []);

  useEffect(() => {
    parseStateFromURL();
  }, [originalRecords]);

  const clearAllFilters = () => {
    setFilters({});
    setSelectedFilters([]);
    clearSearchParams();
  };

  const handleFiltering = (collectedFilters: Filters<T> | {}) => {
    if (!collectedFilters && originalRecords)
      return setFilteredRecords(originalRecords);
    const filteredRecords = filter(originalRecords, (record: T) => {
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

  useEffect(() => {
    if (clearFilters) {
      clearAllFilters();
    }
  }, [clearFilters]);

  const handleChange = (
    filterKey: FilterKey<T>,
    filterValue: FilterValues<T>,
  ) => {
    const newObject = { ...filters, [filterKey]: filterValue } as Filters<T>;
    get(filters, filterKey) === filterValue
      ? removeFilter(filterKey)
      : setFilters(newObject);
  };

  const removeFilter = (targetFilter: FilterKey<T>) => {
    const newFilters = omit(filters, targetFilter) as Filters<T>;
    setFilters(newFilters);
  };

  const removeSelectedFilter = (targetFilter: FilterKey<T>) => {
    const newFilters =
      (omit(selectedFilters, targetFilter) as Filters<T>) || {};
    updateFilterState(newFilters);
  };

  const updateFilterState = (newFilters: Filters<T> | {}) => {
    setSelectedFilters(newFilters);
    setFilters(newFilters);
    isEmpty(newFilters) ? clearSearchParams() : addToSearchParams(newFilters);
    handleFiltering(newFilters);
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
          {selectedFilters &&
            map(selectedFilters, (filter: FilterValues<T>) => {
              if (!filter) return;
              return (
                <StyledChip
                  onClick={(e) => e.stopPropagation()}
                  label={capitalize(`${filter}`)}
                  key={`${filter}`}
                  onDelete={() => {
                    const targetKey = findKey(
                      selectedFilters,
                      (keys) => keys === filter,
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
              filters={filters}
              handleChange={handleChange}
            />
          ))}
        </FiltersContent>
        <FiltersFooter>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              filters && updateFilterState(filters);
            }}
          >
            Apply filters
          </Button>
        </FiltersFooter>
      </FiltersBody>
    </FiltersContainer>
  );
};

export default Filters;
