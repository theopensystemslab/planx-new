import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Accordion, { accordionClasses } from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary, {
  accordionSummaryClasses,
} from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
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
  padding: theme.spacing(2),
  gap: theme.spacing(3),
  background: "#eee",
  "&:hover": {
    background: "#eee",
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
}));

const FilterChip = styled(Button)(({ theme }) => ({
  background: theme.palette.background.default,
  color: theme.palette.text.primary,
  padding: theme.spacing(0.5, 1),
  boxShadow: "none",
  "&::before": {
    content: '"✕"',
    fontSize: "0.8em",
    paddingRight: theme.spacing(0.75),
  },
}));

const FiltersBody = styled(AccordionDetails)(({ theme }) => ({
  background: "#eee",
  padding: 0,
}));

const FiltersContent = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.border.main}`,
  padding: theme.spacing(2.5),
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
}));

const FiltersColumn = styled(Box)(({ theme }) => ({
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
  {
    /*
  - thinking here is to build in type safety into the filter categories
  - create a fn to setFlows based on the filters selected
  - could we build a <FilterGroup> component which has the Column, Typo and ChecklistItems
      ~ This way we could build a type safe filterOptions array which we can iterate over to create
        the filter options. Could make it scale nicely
  - I've also added a new flows list called filteredFlows so we can maintain an original
  */
  }

  const [filters, setFilters] = useState<FilterState>();
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
    });
  }, []);

  const handleFiltering = () => {
    const filterByStatus = flows.filter((flow: FlowSummary) => {
      if (filters?.status) {
        return flow.status === filters.status;
      } else {
        return true;
      }
    });
    filterByStatus && setFilteredFlows(filterByStatus);
    filters && addToSearchParams(filters);
    if (
      !filters?.status &&
      !filters?.applicationType &&
      !filters?.serviceType
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
        {/* Example chips to show active filters */}
        <Box>
          <FilterChip onClick={(e) => e.stopPropagation()}>Online</FilterChip>
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
          <Button variant="contained" color="primary" onClick={handleFiltering}>
            Apply filters
          </Button>
        </FiltersFooter>
      </FiltersBody>
    </FiltersContainer>
  );
};

export default Filters;
