import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { isEmpty } from "lodash";
import React, { useState } from "react";
import { EmptyState } from "ui/editor/EmptyState";
import { InfoChip } from "ui/editor/InfoChip";
import EditorIcon from "ui/icons/Editor";
import { DebouncedSearchInput } from "ui/shared/SearchBox/DebouncedSearchInput";

import { useStore } from "../FlowEditor/lib/store";
import type { FlowCardView, FlowSummary } from "../FlowEditor/lib/store/editor";
import ActiveFlows from "./components/ActiveFlows";
import { AddFlow } from "./components/AddFlow";
import ArchivedFlows from "./components/ArchivedFlows";
import { useDisplayedFlows } from "./components/hooks/useDisplayedFlows";
import { useGetArchivedFlows } from "./components/hooks/useGetArchivedFlows";
import { useGetFlows } from "./components/hooks/useGetFlows";
import FlowsLayout from "./FlowsLayout";
import { filterOptions, sortOptions } from "./helpers/sortAndFilterOptions";

export type FlowView = "flows" | "archive";

interface NoFlowsGetStartedProps {
  size?: "medium" | "small";
}

export const NoFlowsGetStarted: React.FC<NoFlowsGetStartedProps> = ({
  size,
}) => (
  <EmptyState
    size={size}
    icon={<EditorIcon />}
    title="No flows found"
    description="Get started by creating your first flow"
    action={<AddFlow />}
  />
);

interface FlowsProps {
  flows: FlowSummary[];
}

const Flows: React.FC<FlowsProps> = (initialFlows) => {
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

  const navigate = useNavigate();
  const searchParams = useSearch({ from: "/_authenticated/app/$team/flows" });

  const { data } = useGetFlows(teamId);
  // TODO filter out patterns for non-admins
  const flows = data?.flows ?? initialFlows.flows;
  const [flowView, setFlowView] = useState<FlowView>("flows");

  const {
    data: archivedFlowsData,
    loading: archivedFlowsLoading,
    error: archivedFlowsError,
  } = useGetArchivedFlows(teamId, flowView !== "archive");
  const archivedFlows = archivedFlowsData?.flows ?? null;
  const { displayedFlows, isFiltered } = useDisplayedFlows({
    flows,
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

  const handleSearchChange = (value: string) => {
    navigate({
      to: ".",
      search: (prev) => ({ ...prev, search: value || undefined }),
      replace: true,
    });
  };

  const teamHasFlows = !isEmpty(flows) && flows;
  const showAddFlowButton = teamHasFlows && canUserEditTeam(slug);

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
              <DebouncedSearchInput
                value={searchParams.search ?? ""}
                onChange={handleSearchChange}
              />
            )}
          </Box>
          <FlowsLayout flowView={flowView} setFlowView={setFlowView} />
        </Box>

        {flowView === "flows" && (
          <ActiveFlows
            flowsHaveBeenFiltered={isFiltered}
            sortedFlows={displayedFlows}
            sortOptions={sortOptions}
            flowCardView={flowCardView}
            teamId={teamId}
            flows={flows}
            handleViewChange={handleViewChange}
            slug={slug}
          />
        )}
        {flowView === "archive" && (
          <ArchivedFlows
            flowCardView={flowCardView}
            handleViewChange={handleViewChange}
            teamId={teamId}
            slug={slug}
            archivedFlows={archivedFlows}
            loading={archivedFlowsLoading && !archivedFlows}
            error={archivedFlowsError}
            onClearSearch={() => handleSearchChange("")}
          />
        )}

        {flowView === "flows" && flows && !flows.length && (
          <NoFlowsGetStarted />
        )}
      </Container>
    </Box>
  );
};

export default Flows;
