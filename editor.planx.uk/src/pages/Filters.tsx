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
import { FormikConfig, FormikProps } from "formik";
import { useSearch } from "hooks/useSearch";
import React, { useEffect, useState } from "react";
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
  padding: theme.spacing(2.5),
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
}

interface FilterState {
  status?: "online" | "offline";
  applicationType?: "submission" | "guidance";
  serviceType?: "statutory" | "discretionary";
}

type FilterKeys = keyof FilterState;
type FilterValues = FilterState[keyof FilterState];

export const Filters: React.FC<FiltersProps> = ({
  flows,
  setFilteredFlows,
  formik,
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

  const addToSearchParams = (params: FilterState) => {
    const newSearchParams = new URLSearchParams();
    filters &&
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          newSearchParams.set(key, value);
        } else {
          newSearchParams.delete(key);
        }
      });

    navigation.navigate(
      {
        pathname: window.location.pathname,
        search: newSearchParams.toString()
          ? `?${newSearchParams.toString()}`
          : "",
      },
      {
        replace: true,
      },
    );
  };

  useEffect(() => {
    const params = route.url.query;
    if (params) {
      setFilters(params);
      setSelectedFilters(Object.values(params));
      handleFiltering(params);
    }
  }, []);

  useEffect(() => {
    if (formik.values.pattern) {
      search(formik.values.pattern);
      handleFiltering(filters);
    }
  }, [formik.values.pattern]);

  const getSearchResults = () => {
    const searchResults = results.map((result) => result.item);
    return {
      hasSearchResults: Boolean(searchResults[0]),
      searchResults: searchResults,
    };
  };

  const handleFiltering = (filtersArg: FilterState | undefined) => {
    // Get the results of the search
    const { hasSearchResults, searchResults } = getSearchResults();
    // if there's search results, filter those, if not, filter flows
    const resultsToFilter = hasSearchResults ? searchResults : flows;

    // this will filter the above by status only for now
    const filterByStatus = resultsToFilter.filter((flow: FlowSummary) => {
      if (filtersArg?.status) {
        return flow.status === filtersArg.status;
      } else {
        return true;
      }
    });
    // update the list with the new filtered and searched flows
    // if there's no search results, we will just filter by flows again
    // flows stays constant
    if (filterByStatus) {
      setFilteredFlows(filterByStatus);
    }
    if (
      !filtersArg?.status &&
      !filtersArg?.applicationType &&
      !filtersArg?.serviceType
    ) {
      setFilteredFlows(flows);
    }
  };

  const handleChange = (filterKey: FilterKeys, filterValue: FilterValues) =>
    filters?.[filterKey] === filterValue
      ? setFilters({ ...filters, [filterKey]: undefined })
      : setFilters({ ...filters, [filterKey]: filterValue });

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
                    if (filters) {
                      const deleteFilter = Object.keys(filters) as FilterKeys[];
                      const targetFilter = deleteFilter.find(
                        (key: FilterKeys) => {
                          return filters[key] === filter;
                        },
                      );

                      if (targetFilter) {
                        setFilters({ ...filters, [targetFilter]: undefined });
                        handleFiltering({
                          ...filters,
                          [targetFilter]: undefined,
                        });
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
            <ChecklistItem
              onChange={() => handleChange("applicationType", "guidance")}
              label={"Guidance"}
              id={"guidance"}
              checked={filters?.applicationType === "guidance"}
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
                setSelectedFilters(Object.values(filters));
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
