import TableRowsIcon from "@mui/icons-material/TableRows";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import Box from "@mui/material/Box";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup"
import Tooltip from "@mui/material/Tooltip";
import { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import React from "react";

import { FlowCardView } from "../../FlowEditor/lib/store/editor"
import { FlowTable } from "../components/FlowTable";
import { ShowingServicesHeader } from "../components/ShowingServicesHeader";
import { DashboardList } from "./DashboardList"
import FlowCard from "./FlowCard"
import { StyledToggleButton } from "./StyledToggleButton";

type Props = {
    flowCardView: FlowCardView;
    handleViewChange: (_event: React.MouseEvent<HTMLElement>, newView: FlowCardView | null) => void;
    archivedFlows: FlowSummary[] | null;
    teamId: number;
    slug: string;
    fetchFlows: () => void;
}

const Archive: React.FC<Props> = ( { 
    flowCardView, 
    handleViewChange, 
    archivedFlows, 
    teamId,
    slug,
    fetchFlows
} ) => {
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
                            flows={archivedFlows}
                            key={flow.slug}
                            refreshFlows={fetchFlows}
                            showDetails={false}
                        />
                    ))}
                    </DashboardList>
                ) : (
                    <FlowTable
                        flows={archivedFlows}
                        teamId={teamId}
                        teamSlug={slug}
                        refreshFlows={fetchFlows}
                        showDetails={false}
                    />
                )}
                </>
            )}
        </>
    )};
export default Archive;