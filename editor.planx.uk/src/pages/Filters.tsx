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
import React, { useEffect, useState } from "react";
import { useNavigation } from "react-navi";
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
  "&:hover": {
    background: theme.palette.common.white,
  },
  "& > svg": {
    fill: theme.palette.text.primary,
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
}) => {
  const [filters, setFilters] = useState<FilterState>();
  const [selectedFilters, setSelectedFilters] = useState<FilterValues[] | []>();
  const [expanded, setExpanded] = useState<boolean>(false);

  const navigation = useNavigation();

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
    const params = new URLSearchParams(window.location.search);
    let filterObj = {};
    params.forEach((value, key) => {
      switch (key) {
        case "status":
          filterObj = { ...filterObj, status: value };
          break;
        case "applicationType":
          filterObj = { ...filterObj, applicationType: value };
          break;
        case "serviceType":
          filterObj = { ...filterObj, serviceType: value };
          break;
      }
      setFilters(filterObj);
      setSelectedFilters(Object.values(filterObj));
    });
  }, []);

  const handleFiltering = (filtersArg: FilterState) => {
    const filterByStatus = flows.filter((flow: FlowSummary) => {
      if (filtersArg?.status) {
        return flow.status === filtersArg.status;
      } else {
        return true;
      }
    });
    filterByStatus && setFilteredFlows(filterByStatus);
    filtersArg && addToSearchParams(filtersArg);
    filtersArg && setSelectedFilters(Object.values(filtersArg));
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

  filters && console.log(Object.values(filters));

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
            selectedFilters.map(
              (filter) =>
                filter && (
                  <StyledChip
                    sx={{ textTransform: "capitalize" }}
                    onClick={(e) => e.stopPropagation()}
                    label={filter}
                    onDelete={() => {
                      if (filters) {
                        const deleteFilter = Object.keys(
                          filters,
                        ) as FilterKeys[];
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
                ),
            )}
        </Box>
      </FiltersHeader>
      <FiltersBody>
        <FiltersContent>
          <FiltersColumn>
            <Typography variant="h5">Online status</Typography>
            <ChecklistItem
              onChange={() => handleChange("status", "online")}
              label={"Online"}
              checked={filters?.status === "online"}
              variant="compact"
            />
            <ChecklistItem
              onChange={() => handleChange("status", "offline")}
              label={"Offline"}
              checked={filters?.status === "offline"}
              variant="compact"
            />
          </FiltersColumn>
          <FiltersColumn>
            <Typography variant="h5">Application type</Typography>
            <ChecklistItem
              onChange={() => handleChange("applicationType", "submission")}
              label={"Submission"}
              checked={filters?.applicationType === "submission"}
              variant="compact"
            />
            <ChecklistItem
              onChange={() => handleChange("applicationType", "guidance")}
              label={"Guidance"}
              checked={filters?.applicationType === "guidance"}
              variant="compact"
            />
          </FiltersColumn>
          <FiltersColumn>
            <Typography variant="h5">Service type</Typography>
            <ChecklistItem
              onChange={() => handleChange("serviceType", "statutory")}
              label={"Statutory"}
              checked={filters?.serviceType === "statutory"}
              variant="compact"
            />
            <ChecklistItem
              onChange={() => handleChange("serviceType", "discretionary")}
              label={"Discretionary"}
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
              filters && handleFiltering(filters);
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
