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
import { AnyARecord } from "dns";
import { FormikProps } from "formik";
import { useSearch } from "hooks/useSearch";
import { capitalize, debounce } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useCurrentRoute, useNavigation } from "react-navi";
import { Paths, ValueOf } from "type-fest";
import ChecklistItem from "ui/shared/ChecklistItem/ChecklistItem";

import { FiltersColumn } from "./FiltersColumn";
import { FlowSummary } from "./FlowEditor/lib/store/editor";

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
  background: theme.palette.background.midGray,
  "&:hover": {
    background: theme.palette.background.midGray,
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
  background: theme.palette.background.midGray,
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

interface FilterState {
  status?: "online" | "offline";
  applicationType?: "statutory";
  serviceType?: "submission";
}

export const Filters = <T extends object>({
  records,
  setFilteredRecords,
  filterOptions,
  clearFilters,
}: FiltersProps<T>) => {
  const [filters, setFilters] = useState<Filters<T>>();
  const [selectedFilters, setSelectedFilters] = useState<
    FilterValues<T>[] | string[] | []
  >();
  const [expanded, setExpanded] = useState<boolean>(false);

  const navigation = useNavigation();
  const route = useCurrentRoute();

  const addToSearchParams = (params: FilterState) => {
    const searchParams = new URLSearchParams(route.url.search);

    // Update or remove filter parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      } else {
        console.log("hitting delete");
        searchParams.delete(key);
      }
    });

    navigation.navigate(
      {
        pathname: window.location.pathname,
        search: searchParams.toString(), // Use the complete searchParams object
      },
      {
        replace: true,
      },
    );
  };

  const clearSearchParams = () => {
    const searchParams = new URLSearchParams(route.url.search);
    searchParams.delete("status");
    searchParams.delete("applicationType");
    searchParams.delete("serviceType");
    navigation.navigate(
      {
        pathname: window.location.pathname,
        search: searchParams.toString(), // Use the complete searchParams object
      },
      {
        replace: true,
      },
    );
  };

  const clearAllFilters = () => {
    setFilters({});
    setSelectedFilters([]);
    clearSearchParams();
  };

  const handleFiltering = (filtersArg: FilterState | undefined) => {
    if (!resultsToFilter[0]) {
      return setFilteredRecords(searchResults);
    }
    // this will filter the above by status or app type only for now
    const filteredList = filterListByKeys(resultsToFilter);

    if (filteredList) {
      setFilteredRecords(filteredList);
    }
    if (
      !filtersArg?.status &&
      !filtersArg?.applicationType &&
      !filtersArg?.serviceType &&
      !hasSearchResults
    ) {
      setFilteredRecords(records);
    }
  };

  useEffect(() => {
    const { status, applicationType, serviceType }: FilterState =
      route.url.query;
    const filtersToAssign = {
      status: status,
      applicationType: applicationType,
      serviceType: serviceType,
    };
    if (status || applicationType || serviceType) {
      setFilters(filtersToAssign);
      setSelectedFilters(Object.values(filtersToAssign));
      handleFiltering(filtersToAssign);
    }
  }, []);

  useEffect(() => {
    if (clearFilters) {
      clearAllFilters();
    }
  }, [clearFilters]);

  const handleChange = (filterKey: FilterKeys, filterValue: FilterValues) =>
    filters?.[filterKey] === filterValue
      ? removeFilter(filterKey)
      : setFilters({ ...filters, [filterKey]: filterValue });

  const removeFilter = (targetFilter: FilterKeys) => {
    const newFilters = { ...filters };
    delete newFilters[targetFilter];
    setFilters(newFilters);
  };

  console.log(filters);

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
        {/* <Box sx={{ display: "flex", gap: 1 }}>
          {selectedFilters &&
            selectedFilters.map((filter) => {
              if (!filter) return;
              return (
                <StyledChip
                  sx={{ textTransform: "capitalize" }}
                  onClick={(e) => e.stopPropagation()}
                  label={filter}
                  key={filter}
                  onDelete={() => {
                    const newSelectedFilters =
                      (selectedFilters.filter(
                        (selectedFilter) =>
                          selectedFilter !== filter &&
                          selectedFilter !== undefined,
                      ) as string[]) || [];
                    console.log(newSelectedFilters);
                    setSelectedFilters(newSelectedFilters);
                    if (filters) {
                      const deleteFilter = Object.keys(filters) as FilterKeys[];
                      const targetFilter = deleteFilter.find(
                        (key: FilterKeys) => {
                          return filters[key] === filter;
                        },
                      );

                      if (targetFilter) {
                        const newFilters = { ...filters };
                        delete newFilters[targetFilter];
                        removeFilter(targetFilter);
                        addToSearchParams({
                          ...filters,
                          [targetFilter]: undefined,
                        });
                        handleFiltering(newFilters);
                      }
                    }
                  }}
                />
              );
            })}
        </Box> */}
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
              if (filters) {
                handleFiltering(filters);
                addToSearchParams(filters);
                setSelectedFilters(
                  Object.values(filters).filter(
                    (values) => values !== undefined,
                  ),
                );
              }
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
