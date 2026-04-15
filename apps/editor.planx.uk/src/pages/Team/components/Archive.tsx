import TableRowsIcon from "@mui/icons-material/TableRows";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import Box from "@mui/material/Box";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import React from "react";
import ErrorSummary from "ui/shared/ErrorSummary/ErrorSummary";

import { FlowCardView } from "../../FlowEditor/lib/store/editor";
import { FlowTable } from "../components/FlowTable";
import { ShowingServicesHeader } from "../components/ShowingServicesHeader";
import { DashboardList } from "./DashboardList";
import FlowCard from "./FlowCard";
import { useGetArchivedFlows } from "./hooks/useGetArchivedFlows";
import { StyledToggleButton } from "./StyledToggleButton";
type Props = {
  flowCardView: FlowCardView;
  handleViewChange: (
    _event: React.MouseEvent<HTMLElement>,
    newView: FlowCardView | null,
  ) => void;
  teamId: number;
  slug: string;
  fetchFlows: () => void;
};

const Archive: React.FC<Props> = ({
  flowCardView,
  handleViewChange,
  teamId,
  slug,
  fetchFlows,
}) => {
  const {
    data: archivedFlowsData,
    loading,
    error,
  } = useGetArchivedFlows(teamId);
  const archivedFlows = archivedFlowsData?.flows ?? null;

  if (error) {
    return (
      <Box sx={{ pt: 2 }}>
        <ErrorSummary message={error.message} />
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          pt: 2,
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: 2,
          minHeight: "50px",
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }
  return (
    <>
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
            pt: 2,
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: 2,
            minHeight: "50px",
          }}
        >
          <ShowingServicesHeader
            matchedFlowsCount={archivedFlows?.length || 0}
          />
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
      {archivedFlows && (
        <>
          {flowCardView === "grid" ? (
            <DashboardList>
              {archivedFlows.map((flow) => (
                <FlowCard
                  flow={flow}
                  key={flow.slug}
                  refreshFlows={fetchFlows}
                  view={"archive"}
                />
              ))}
            </DashboardList>
          ) : (
            <FlowTable
              flows={archivedFlows}
              teamId={teamId}
              teamSlug={slug}
              refreshFlows={fetchFlows}
              view={"archive"}
            />
          )}
        </>
      )}
    </>
  );
};
export default Archive;
