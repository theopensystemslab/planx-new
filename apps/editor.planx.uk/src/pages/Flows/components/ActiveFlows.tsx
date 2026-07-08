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
import type { SortableFields } from "ui/editor/SortControl/SortControl";
import { SortControl } from "ui/editor/SortControl/SortControl";

import type { FlowSummary } from "../../FlowEditor/lib/store/editor";
import type { FlowCardView } from "../../FlowEditor/lib/store/editor";
import { filterOptions } from "../helpers/sortAndFilterOptions";
import FlowCard from "./FlowCard";
import { FlowGrid } from "./FlowGrid";
import { FlowTable } from "./FlowTable";
import { ShowingServicesHeader } from "./ShowingServicesHeader";
import { StyledToggleButton } from "./StyledToggleButton";

const FiltersContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  marginBottom: theme.spacing(1),
  padding: theme.spacing(1.5, 0),
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.border.light}`,
}));

type Props = {
  flowsHaveBeenFiltered: boolean;
  sortedFlows: FlowSummary[] | null;
  sortOptions: SortableFields<FlowSummary>[];
  flowCardView: FlowCardView;
  teamId: number;
  flows: FlowSummary[] | null;
  handleViewChange: (
    _event: React.MouseEvent<HTMLElement>,
    newView: FlowCardView | null,
  ) => void;
  slug: string;
};

const ActiveFlows: React.FC<Props> = ({
  flowsHaveBeenFiltered,
  sortedFlows,
  sortOptions,
  flowCardView,
  teamId,
  handleViewChange,
  slug,
  flows,
}) => {
  const teamHasFlows = Boolean(flows && flows.length);
  const navigate = useNavigate();

  const sortedPinnedFlows =
    sortedFlows?.filter((flow) => flow.pinnedFlows.length > 0) ?? [];
  const sortedUnpinnedFlows =
    sortedFlows?.filter((flow) => flow.pinnedFlows.length === 0) ?? null;

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
        </FiltersContainer>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
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
            {sortedFlows && sortedFlows.length > 0 && (
              <ShowingServicesHeader
                matchedFlowsCount={sortedFlows.length}
                isFiltered={flowsHaveBeenFiltered}
              />
            )}
            {flowsHaveBeenFiltered && (
              <Button
                onClick={() => {
                  navigate({
                    to: ".",
                    search: (prev) => ({
                      ...prev,
                      "service-status": undefined,
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
        {flowCardView === "grid" ? (
          <>
            {sortedPinnedFlows.length > 0 && (
              <FlowGrid>
                {sortedPinnedFlows.map((flow) => (
                  <FlowCard flow={flow} key={flow.slug} view={"flows"} />
                ))}
              </FlowGrid>
            )}
            {sortedUnpinnedFlows && sortedUnpinnedFlows.length > 0 && (
              <Box>
                <FlowGrid>
                  {sortedUnpinnedFlows.map((flow) => (
                    <FlowCard flow={flow} key={flow.slug} view={"flows"} />
                  ))}
                </FlowGrid>
              </Box>
            )}
          </>
        ) : (
          <FlowTable
            pinnedFlows={sortedPinnedFlows}
            unpinnedFlows={sortedUnpinnedFlows ?? []}
            teamId={teamId}
            teamSlug={slug}
            view={"flows"}
          />
        )}
      </>
    )
  );
};

export default ActiveFlows;
