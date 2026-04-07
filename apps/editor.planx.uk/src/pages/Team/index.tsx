import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { hasFeatureFlag } from "lib/featureFlags";
import { isEmpty, orderBy } from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { InfoChip } from "ui/editor/InfoChip";
import { SearchBox } from "ui/shared/SearchBox/SearchBox";

import { useStore } from "../FlowEditor/lib/store";
import { FlowCardView, FlowSummary } from "../FlowEditor/lib/store/editor";
import { AddFlow } from "./components/AddFlow";
import { DashboardList } from "./components/DashboardList";
import { Card, CardContent } from "./components/FlowCard/styles";
import Flows from "./components/Flows";
import { sortOptions } from "./helpers/sortAndFilterOptions";
import TeamLayout from "./TeamLayout";

export type FlowView = "flows" | "archive";

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
  const [flowView, setFlowView] = useState<FlowView>("flows");
  const [shouldClearSearch, setShouldClearSearch] = useState<boolean>(false);
  const searchParams = useSearch({ from: "/_authenticated/app/$team/" });
  const navigate = useNavigate();

  const pinnedFlows = useMemo(() => {
    return flows?.filter((flow) => flow.pinnedFlows.length > 0) ?? [];
  }, [flows]);

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

  const updateFlow = useCallback((updatedFlow: FlowSummary) => {
    const updateSingleFlow = (prev: FlowSummary[] | null) =>
      prev?.map((f) => (f.id === updatedFlow.id ? updatedFlow : f)) ?? prev;

    setFlows(updateSingleFlow);
    setSearchedFlows(updateSingleFlow);
  }, []);

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
        <Box>
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

        <Flows
          flowsHaveBeenFiltered={flowsHaveBeenFiltered}
          setSearchedFlows={setSearchedFlows}
          setShouldClearSearch={setShouldClearSearch}
          sortedFlows={sortedFlows}
          sortOptions={sortOptions}
          flowCardView={flowCardView}
          fetchFlows={fetchFlows}
          teamId={teamId}
          flows={flows}
          pinnedFlows={pinnedFlows}
          handleViewChange={handleViewChange}
          slug={slug}
          updateFlow={updateFlow}
        />

        {hasFeatureFlag("ARCHIVE_VIEW") && (
          <TeamLayout flowView={flowView} setFlowView={setFlowView} />
        )}

        {flows && !flows.length && <GetStarted />}
      </Container>
    </Box>
  );
};

export default Team;
