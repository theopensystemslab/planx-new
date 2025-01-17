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
import { FormikProps } from "formik";
import { useSearch } from "hooks/useSearch";
import { debounce } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useCurrentRoute, useNavigation } from "react-navi";
import ChecklistItem from "ui/shared/ChecklistItem/ChecklistItem";

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

const FiltersColumn = styled(Box)(() => ({
  flexBasis: "20%",
}));

const FiltersFooter = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.border.main}`,
  padding: theme.spacing(1.5, 2),
}));

interface FiltersProps {
  flows: FlowSummary[];
  setFilteredFlows: React.Dispatch<React.SetStateAction<FlowSummary[] | null>>;
  formik: FormikProps<{ pattern: string; keys: string[] }>;
  clearFilters: boolean;
}

interface FilterState {
  status?: "online" | "offline";
  applicationType?: "submission";
  serviceType?: "statutory" | "discretionary";
}

type FilterKeys = keyof FilterState;
type FilterValues = FilterState[keyof FilterState];

export const Filters: React.FC<FiltersProps> = ({
  flows,
  setFilteredFlows,
  formik,
  clearFilters,
}) => {
  const [filters, setFilters] = useState<FilterState>();
  const [selectedFilters, setSelectedFilters] = useState<
    FilterValues[] | string[] | []
  >();
  const [expanded, setExpanded] = useState<boolean>(false);

  const navigation = useNavigation();
  const route = useCurrentRoute();

  const { results, search } = useSearch({
    list: flows,
    keys: formik.values.keys,
  });

  const debouncedSearch = useMemo(
    () =>
      debounce((pattern: string) => {
        console.debug("Search term: ", pattern);
        search(pattern);
      }, 250),
    [search],
  );

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
    formik.setFieldValue("pattern", "");
    clearSearchParams();
  };

  const handleFiltering = (filtersArg: FilterState | undefined) => {
    // Get the results of the search
    const { hasSearchResults, searchResults } = getSearchResults();
    // if there's search results, filter those, if not, filter flows
    const resultsToFilter = hasSearchResults ? searchResults : flows;

    // this will filter the above by status or app type only for now
    const filteredList = filterListByKeys(resultsToFilter);

    if (filteredList) {
      setFilteredFlows(filteredList);
    }
    if (
      !filtersArg?.status &&
      !filtersArg?.applicationType &&
      !filtersArg?.serviceType &&
      !hasSearchResults
    ) {
      setFilteredFlows(flows);
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
    debouncedSearch(formik.values.pattern);
    if (formik.values.pattern) {
      handleFiltering(filters);
    }
    if (!formik.values.pattern && filters) {
      handleFiltering(filters);
    }
  }, [
    formik.values.pattern,
    search,
    debouncedSearch,
    results,
    selectedFilters,
  ]);

  useEffect(() => {
    if (clearFilters) {
      clearAllFilters();
    }
  }, [clearFilters]);

  const getSearchResults = () => {
    const searchResults = results.map((result) => result.item);
    return {
      hasSearchResults: Boolean(searchResults[0]),
      searchResults: searchResults,
    };
  };

  const filterListByKeys = (recordToFilter: FlowSummary[]) => {
    if (!selectedFilters?.[0]) return recordToFilter;
    const filteredResults = recordToFilter.filter((flow) => {
      return selectedFilters.every((selectedFilterValue) => {
        // Handle status filter
        if (
          selectedFilterValue === "online" ||
          selectedFilterValue === "offline"
        )
          return flow.status === selectedFilterValue;

        // Handle applicationType (submission) filter
        if (selectedFilterValue === "submission")
          return flow.publishedFlows[0]?.hasSendComponent === true;
        return true;
      });
    });
    return filteredResults;
  };

  const handleChange = (filterKey: FilterKeys, filterValue: FilterValues) =>
    filters?.[filterKey] === filterValue
      ? removeFilter(filterKey)
      : setFilters({ ...filters, [filterKey]: filterValue });

  const removeFilter = (targetFilter: FilterKeys) => {
    const newFilters = { ...filters };
    delete newFilters[targetFilter];
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
        </Box>
      </FiltersHeader>
      <FiltersBody>
        <FiltersContent>
          <FiltersColumn>
            <Typography variant="h5" pb={0.5}>
              Online status
            </Typography>
            <ChecklistItem
              onChange={() => handleChange("status", "online")}
              label={"Online"}
              id={"online"}
              checked={filters?.status === "online"}
              variant="compact"
            />
            <ChecklistItem
              onChange={() => handleChange("status", "offline")}
              label={"Offline"}
              id={"offline"}
              checked={filters?.status === "offline"}
              variant="compact"
            />
          </FiltersColumn>
          <FiltersColumn>
            <Typography variant="h5" pb={0.5}>
              Application type
            </Typography>
            <ChecklistItem
              onChange={() => handleChange("applicationType", "submission")}
              label={"Submission"}
              id={"submission"}
              checked={filters?.applicationType === "submission"}
              variant="compact"
            />
          </FiltersColumn>
          <FiltersColumn>
            <Typography variant="h5" pb={0.5}>
              Service type
            </Typography>
            <ChecklistItem
              onChange={() => handleChange("serviceType", "statutory")}
              label={"Statutory"}
              id={"statutory"}
              checked={filters?.serviceType === "statutory"}
              variant="compact"
            />
            <ChecklistItem
              onChange={() => handleChange("serviceType", "discretionary")}
              label={"Discretionary"}
              id={"discretionary"}
              checked={filters?.serviceType === "discretionary"}
              variant="compact"
            />
          </FiltersColumn>
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
