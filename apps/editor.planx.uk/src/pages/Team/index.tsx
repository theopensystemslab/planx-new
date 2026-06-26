import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { isEmpty } from "lodash";
import React, { useEffect, useState } from "react";
import { EmptyState } from "ui/editor/EmptyState";
import { InfoChip } from "ui/editor/InfoChip";
import { SearchBox } from "ui/shared/SearchBox/SearchBox";

import { useStore } from "../FlowEditor/lib/store";
import { FlowCardView, FlowSummary } from "../FlowEditor/lib/store/editor";
import { AddFlow } from "./components/AddFlow";
import Archive from "./components/Archive";
import Flows from "./components/Flows";
import { useFlowFilters } from "./components/hooks/useFlowFilters";
import { useGetArchivedFlows } from "./components/hooks/useGetArchivedFlows";
import { useGetFlows } from "./components/hooks/useGetFlows";
import { filterOptions, sortOptions } from "./helpers/sortAndFilterOptions";
import TeamLayout from "./TeamLayout";

export type FlowView = "flows" | "archive";

export const NoFlowsGetStarted: React.FC = () => (
  <EmptyState
    title="No flows found"
    description="Get started by creating your first flow"
    action={<AddFlow />}
  />
);

interface TeamProps {
  flows: FlowSummary[];
}

const Team: React.FC<TeamProps> = (initialFlows) => {
  const [
    { id: teamId, slug },
    canUserEditTeam,
    isTrial,
    flowCardView,
    setFlowCardView,
  ] = useStore((state) => [
    state.getTeam(),
    state.canUserEditTeam,
    state.teamSettings?.isTrial,
    state.flowCardView,
    state.setFlowCardView,
  ]);

  const { data } = useGetFlows(teamId);
  const flows = data?.flows ?? initialFlows.flows;
  const [flowView, setFlowView] = useState<FlowView>("flows");

  const {
    data: archivedFlowsData,
    loading: archivedFlowsLoading,
    error: archivedFlowsError,
  } = useGetArchivedFlows(teamId, flowView !== "archive");
  const archivedFlows = archivedFlowsData?.flows ?? null;

  const [searchedFlows, setSearchedFlows] = useState<FlowSummary[] | null>(
    null,
  );
  const [searchedArchivedFlows, setSearchedArchivedFlows] = useState<
    FlowSummary[] | null
  >(null);
  const [shouldClearSearch, setShouldClearSearch] = useState<boolean>(false);

  const { sortedFlows } = useFlowFilters({
    flows: searchedFlows ?? flows,
    filterOptions,
    sortOptions,
  });

  const handleViewChange = (
    _event: React.MouseEvent<HTMLElement>,
    newView: FlowCardView | null,
  ) => {
    if (newView !== null) {
      setFlowCardView(newView);
    }
  };

  useEffect(() => {
    if (shouldClearSearch) {
      setShouldClearSearch(false);
    }
  }, [shouldClearSearch]);

  const teamHasFlows = !isEmpty(flows) && flows;
  const showAddFlowButton = teamHasFlows && canUserEditTeam(slug);
  const flowsHaveBeenFiltered = sortedFlows?.length !== flows?.length;

  const displayedArchivedFlows = searchedArchivedFlows ?? archivedFlows;
  const archiveIsFiltered =
    displayedArchivedFlows?.length !== archivedFlows?.length;

  return (
    <Box sx={{ bgcolor: "background.paper", flexGrow: 1 }}>
      <Container maxWidth="contentWide">
        <Box>
          <Box
            sx={{
              pb: 1,
              display: "flex",
              flexDirection: { xs: "column", contentWrap: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", contentWrap: "center" },
              minHeight: (theme) => theme.spacing(6),
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
              <Typography variant="h2" component="h1" sx={{ pr: 1 }}>
                Flows
              </Typography>
              {isTrial && <InfoChip label="Trial account" />}
              {showAddFlowButton && flowView === "flows" && <AddFlow />}
            </Box>
            {((flowView === "flows" && teamHasFlows) ||
              (flowView === "archive" &&
                archivedFlows &&
                archivedFlows.length > 0)) && (
              <SearchBox<FlowSummary>
                records={flowView === "archive" ? (archivedFlows ?? []) : flows}
                setRecords={
                  flowView === "archive"
                    ? setSearchedArchivedFlows
                    : setSearchedFlows
                }
                searchKey={["name", "slug"]}
                clearSearch={shouldClearSearch}
              />
            )}
          </Box>
          <TeamLayout flowView={flowView} setFlowView={setFlowView} />
        </Box>

        {flowView === "flows" && (
          <Flows
            flowsHaveBeenFiltered={flowsHaveBeenFiltered}
            setSearchedFlows={setSearchedFlows}
            setShouldClearSearch={setShouldClearSearch}
            sortedFlows={sortedFlows}
            sortOptions={sortOptions}
            flowCardView={flowCardView}
            teamId={teamId}
            flows={flows}
            handleViewChange={handleViewChange}
            slug={slug}
          />
        )}
        {flowView === "archive" && (
          <Archive
            flowCardView={flowCardView}
            handleViewChange={handleViewChange}
            teamId={teamId}
            slug={slug}
            archivedFlows={displayedArchivedFlows}
            loading={archivedFlowsLoading && !displayedArchivedFlows}
            error={archivedFlowsError}
            isFiltered={archiveIsFiltered}
            onClearSearch={() => {
              setSearchedArchivedFlows(null);
              setShouldClearSearch(true);
            }}
          />
        )}

        {flowView === "flows" && flows && !flows.length && (
          <NoFlowsGetStarted />
        )}
      </Container>
    </Box>
  );
};

export default Team;
