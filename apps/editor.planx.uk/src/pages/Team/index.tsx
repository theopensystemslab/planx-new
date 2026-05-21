import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useSearch } from "@tanstack/react-router";
import { isEmpty, orderBy } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { EmptyState } from "ui/editor/EmptyState";
import { InfoChip } from "ui/editor/InfoChip";
import { SearchBox } from "ui/shared/SearchBox/SearchBox";

import { useStore } from "../FlowEditor/lib/store";
import { FlowCardView, FlowSummary } from "../FlowEditor/lib/store/editor";
import { AddFlow } from "./components/AddFlow";
import Archive from "./components/Archive";
import Flows from "./components/Flows";
import { useGetArchivedFlows } from "./components/hooks/useGetArchivedFlows";
import { useGetFlows } from "./components/hooks/useGetFlows";
import { sortOptions } from "./helpers/sortAndFilterOptions";
import TeamLayout from "./TeamLayout";

export type FlowView = "flows" | "archive";

const GetStarted: React.FC = () => (
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
  const searchParams = useSearch({ from: "/_authenticated/app/$team/flows" });

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

        {flowView === "flows" && flows && !flows.length && <GetStarted />}
      </Container>
    </Box>
  );
};

export default Team;
