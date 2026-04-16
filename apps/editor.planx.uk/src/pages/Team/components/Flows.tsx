import TableRowsIcon from "@mui/icons-material/TableRows";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useNavigate } from "@tanstack/react-router";
import React from "react";
import Filters from "ui/editor/Filter/Filter";
import { SortControl } from "ui/editor/SortControl/SortControl";
import { SortableFields } from "ui/editor/SortControl/SortControl";

import { FlowSummary } from "../../FlowEditor/lib/store/editor";
import { FlowCardView } from "../../FlowEditor/lib/store/editor";
import FlowCard from "../components/FlowCard/";
import { FlowTable } from "../components/FlowTable";
import { ShowingServicesHeader } from "../components/ShowingServicesHeader";
import { filterOptions } from "../helpers/sortAndFilterOptions";
import { DashboardList } from "./DashboardList";
import { StyledToggleButton } from "./StyledToggleButton";

const FiltersContainer = styled(Box)(({ theme }) => ({
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

type Props = {
  flowsHaveBeenFiltered: boolean;
  setSearchedFlows: (searchedFlows: FlowSummary[] | null) => void;
  setShouldClearSearch: (shouldClearSearch: boolean) => void;
  sortedFlows: FlowSummary[] | null;
  sortOptions: SortableFields<FlowSummary>[];
  flowCardView: FlowCardView;
  teamId: number;
  flows: FlowSummary[] | null;
  pinnedFlows: FlowSummary[];
  unpinnedFlows: FlowSummary[];
  handleViewChange: (
    _event: React.MouseEvent<HTMLElement>,
    newView: FlowCardView | null,
  ) => void;
  slug: string;
  userId: number;
};

const Flows: React.FC<Props> = ({
  flowsHaveBeenFiltered,
  setSearchedFlows,
  setShouldClearSearch,
  sortedFlows,
  sortOptions,
  flowCardView,
  teamId,
  pinnedFlows,
  handleViewChange,
  slug,
  userId,
}) => {
  const teamHasFlows = sortedFlows ? true : false;
  const navigate = useNavigate();

  const showPinnedFlows = pinnedFlows.length > 0 && !flowsHaveBeenFiltered;
  const sortedPinnedFlows = showPinnedFlows
    ? (sortedFlows?.filter((flow) => flow.pinnedFlows.length > 0) ?? [])
    : [];
  const remainingFlows = showPinnedFlows
    ? (sortedFlows?.filter((flow) => flow.pinnedFlows.length === 0) ?? null)
    : sortedFlows;

  return (
    teamHasFlows && (
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
        </FiltersContainer>
        {sortedPinnedFlows.length > 0 && (
          <Box>
            <Box
              sx={{ minHeight: "50px", display: "flex", alignItems: "center" }}
            >
              <ShowingServicesHeader
                matchedFlowsCount={sortedPinnedFlows.length}
                isPinnedFlows={true}
              />
            </Box>
            {flowCardView === "grid" ? (
              <DashboardList>
                {sortedPinnedFlows.map((flow) => (
                  <FlowCard
                    flow={flow}
                    key={flow.slug}
                    view={"flows"}
                    userId={userId}
                  />
                ))}
              </DashboardList>
            ) : (
              <FlowTable
                flows={sortedPinnedFlows}
                teamId={teamId}
                teamSlug={slug}
                view={"flows"}
                userId={userId}
              />
            )}
          </Box>
        )}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
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
              isFiltered={flowsHaveBeenFiltered}
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
        </Box>
        {remainingFlows && (
          <>
            {flowCardView === "grid" ? (
              <DashboardList>
                {remainingFlows.map((flow) => (
                  <FlowCard
                    flow={flow}
                    key={flow.slug}
                    view={"flows"}
                    userId={userId}
                  />
                ))}
              </DashboardList>
            ) : (
              <FlowTable
                flows={remainingFlows}
                teamId={teamId}
                teamSlug={slug}
                view={"flows"}
                userId={userId}
              />
            )}
          </>
        )}
      </>
    )
  );
};

export default Flows;
