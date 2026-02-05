import TableRowsIcon from "@mui/icons-material/TableRows";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import ToggleButton, { toggleButtonClasses } from "@mui/material/ToggleButton";
import ToggleButtonGroup, {
  toggleButtonGroupClasses,
} from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { isEmpty, orderBy } from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Filters from "ui/editor/Filter/Filter";
import { InfoChip } from "ui/editor/InfoChip";
import { SortControl } from "ui/editor/SortControl/SortControl";
import { SearchBox } from "ui/shared/SearchBox/SearchBox";

import { useStore } from "../FlowEditor/lib/store";
import { FlowCardView, FlowSummary } from "../FlowEditor/lib/store/editor";
import { AddFlow } from "./components/AddFlow";
import FlowCard from "./components/FlowCard/";
import { Card, CardContent } from "./components/FlowCard/styles";
import { FlowTable } from "./components/FlowTable";
import { ShowingServicesHeader } from "./components/ShowingServicesHeader";
import { filterOptions, sortOptions } from "./helpers/sortAndFilterOptions";

const DashboardList = styled("ul")(({ theme }) => ({
  padding: theme.spacing(2, 0, 3),
  margin: 0,
  gap: theme.spacing(2),
  display: "grid",
  gridAutoRows: "1fr",
  gridTemplateColumns: "repeat(1, 1fr)",
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "repeat(2, 1fr)",
  },
  [theme.breakpoints.up("lg")]: {
    gridTemplateColumns: "repeat(3, 1fr)",
  },
}));

export const FiltersContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  margin: theme.spacing(1, 0, 2),
  padding: theme.spacing(1.5, 0),
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(1),
  borderTop: `1px solid ${theme.palette.border.light}`,
  borderBottom: `1px solid ${theme.palette.border.light}`,
}));

export const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderColor: theme.palette.border.main,
  borderRadius: 0,
  margin: 0,
  [`&.${toggleButtonGroupClasses.lastButton}`]: {
    borderColor: theme.palette.border.main,
  },
  "&:hover": {
    backgroundColor: theme.palette.background.paper,
  },
  [`&.${toggleButtonClasses.selected}`]: {
    backgroundColor: theme.palette.background.default,
    boxShadow: `0 -4px 0 0 ${theme.palette.info.main} inset`,
  },
  [`&.${toggleButtonClasses.selected}:hover`]: {
    backgroundColor: theme.palette.background.default,
  },
}));

const GetStarted: React.FC = () => (
  <DashboardList sx={{ paddingTop: 2 }}>
    <Card>
      <CardContent>
        <Typography variant="h3">No services found</Typography>
        <Typography>Get started by creating your first service</Typography>
        <AddFlow />
      </CardContent>
    </Card>
  </DashboardList>
);

interface TeamProps {
  flows: FlowSummary[];
}

const Team: React.FC<TeamProps> = ({ flows: initialFlows }) => {
  const [
    { id: teamId, slug },
    canUserEditTeam,
    getFlows,
    isTrial,
    flowCardView,
    setFlowCardView,
  ] = useStore((state) => [
    state.getTeam(),
    state.canUserEditTeam,
    state.getFlows,
    state.teamSettings?.isTrial,
    state.flowCardView,
    state.setFlowCardView,
  ]);

  const [flows, setFlows] = useState<FlowSummary[] | null>(initialFlows);
  const [searchedFlows, setSearchedFlows] = useState<FlowSummary[] | null>(
    null,
  );
  const [shouldClearSearch, setShouldClearSearch] = useState<boolean>(false);
  const searchParams = useSearch({ from: "/_authenticated/team/$team/" });
  const navigate = useNavigate();

  const sortedFlows = useMemo(() => {
    // Use searchedFlows if available (from SearchBox), otherwise use all flows
    const sourceFlows = searchedFlows || flows;
    if (!sourceFlows) return null;

    let result = [...sourceFlows];

    // Apply filters based on search params
    if (searchParams["online-status"]) {
      result = result.filter(
        (flow) => flow.status === searchParams["online-status"],
      );
    }

    if (searchParams["flow-type"]) {
      if (searchParams["flow-type"] === "submission") {
        result = result.filter(
          (flow) => flow.publishedFlows[0]?.hasSendComponent,
        );
      } else if (searchParams["flow-type"] === "fee carrying") {
        result = result.filter(
          (flow) => flow.publishedFlows[0]?.hasVisiblePayComponent,
        );
      } else if (searchParams["flow-type"] === "service charge enabled") {
        result = result.filter(
          (flow) => flow.publishedFlows[0]?.hasEnabledServiceCharge,
        );
      }
    }

    if (searchParams.templates) {
      if (searchParams.templates === "templated") {
        result = result.filter((flow) => Boolean(flow.templatedFrom));
      } else if (searchParams.templates === "source template") {
        result = result.filter((flow) => Boolean(flow.isTemplate));
      }
    }

    if (searchParams["lps-listing"]) {
      if (searchParams["lps-listing"] === "listed") {
        result = result.filter((flow) => flow.isListedOnLPS === true);
      } else if (searchParams["lps-listing"] === "not listed") {
        result = result.filter((flow) => flow.isListedOnLPS === false);
      }
    }

    // Apply sorting
    const sortObject =
      sortOptions.find(
        (option) =>
          option.displayName
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "") === searchParams.sort,
      ) || sortOptions[0];

    result = orderBy(result, sortObject.fieldName, searchParams.sortDirection);

    return result;
  }, [searchedFlows, flows, searchParams]);

  const handleViewChange = (
    _event: React.MouseEvent<HTMLElement>,
    newView: FlowCardView | null,
  ) => {
    if (newView !== null) {
      setFlowCardView(newView);
    }
  };

  const fetchFlows = useCallback(() => {
    getFlows(teamId).then((flows) => {
      // Copy the array and sort by most recently edited desc using last associated operation.createdAt, not flow.updatedAt
      setFlows(flows);
    });
  }, [teamId, setFlows, getFlows]);

  useEffect(() => {
    if (initialFlows) {
      setFlows(initialFlows);
    }
  }, [initialFlows]);

  useEffect(() => {
    if (shouldClearSearch) {
      setShouldClearSearch(false);
    }
  }, [shouldClearSearch]);

  const teamHasFlows = !isEmpty(flows) && flows;
  const showAddFlowButton = teamHasFlows && canUserEditTeam(slug);
  const flowsHaveBeenFiltered = sortedFlows?.length !== flows?.length;

  return (
    <Box bgcolor={"background.paper"} flexGrow={1}>
      <Container maxWidth="contentWide">
        <Box
          pb={1}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", contentWrap: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", contentWrap: "center" },
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography variant="h2" component="h1" pr={1}>
              Flows
            </Typography>
            {isTrial && <InfoChip label="Trial account" />}
            {showAddFlowButton && <AddFlow />}
          </Box>
          {teamHasFlows && (
            <SearchBox<FlowSummary>
              records={flows}
              setRecords={setSearchedFlows}
              searchKey={["name", "slug"]}
              clearSearch={shouldClearSearch}
            />
          )}
        </Box>
        {teamHasFlows && (
          <>
            <FiltersContainer>
              <Filters<FlowSummary> filterOptions={filterOptions} />
              {teamHasFlows && sortedFlows && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" sx={{ width: "70px" }}>
                    <strong>Sort by</strong>
                  </Typography>
                  <SortControl<FlowSummary> sortOptions={sortOptions} />
                </Box>
              )}
            </FiltersContainer>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  gap: 2,
                  minHeight: "50px",
                }}
              >
                <ShowingServicesHeader
                  matchedFlowsCount={sortedFlows?.length || 0}
                />
                {flowsHaveBeenFiltered && (
                  <Button
                    onClick={() => {
                      setSearchedFlows(null);
                      setShouldClearSearch(true);
                      navigate({
                        to: ".",
                        search: (prev) => ({
                          ...prev,
                          "online-status": undefined,
                          "flow-type": undefined,
                          templates: undefined,
                          "lps-listing": undefined,
                          search: undefined,
                        }),
                        replace: true,
                      });
                    }}
                    variant="link"
                  >
                    Clear filters
                  </Button>
                )}
              </Box>
              <ToggleButtonGroup
                value={flowCardView}
                exclusive
                onChange={handleViewChange}
                size="small"
              >
                <Tooltip title="Card view" placement="bottom">
                  <StyledToggleButton value="grid" disableRipple>
                    <ViewModuleIcon />
                  </StyledToggleButton>
                </Tooltip>
                <Tooltip title="Table view" placement="bottom">
                  <StyledToggleButton value="row" disableRipple>
                    <TableRowsIcon />
                  </StyledToggleButton>
                </Tooltip>
              </ToggleButtonGroup>
            </Box>
            {sortedFlows && (
              <>
                {flowCardView === "grid" ? (
                  <DashboardList>
                    {sortedFlows.map((flow) => (
                      <FlowCard
                        flow={flow}
                        flows={flows}
                        key={flow.slug}
                        refreshFlows={fetchFlows}
                      />
                    ))}
                  </DashboardList>
                ) : (
                  <FlowTable
                    flows={sortedFlows}
                    teamId={teamId}
                    teamSlug={slug}
                    refreshFlows={fetchFlows}
                  />
                )}
              </>
            )}
          </>
        )}
        {flows && !flows.length && <GetStarted />}
      </Container>
    </Box>
  );
};

export default Team;
