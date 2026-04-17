import Box from "@mui/material/Box";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import React from "react";
import FlowTag from "ui/editor/FlowTag/FlowTag";
import { FlowTagType } from "ui/editor/FlowTag/types";
import TruncatedText from "ui/editor/TruncatedText";

import { useStore } from "../../../FlowEditor/lib/store";
import FlowMenu from "../FlowMenu";
import { FlowPinButton } from "../FlowPinButton";
import { FlowTemplateIndicator } from "../FlowTemplateIndicator";
import { useFlowDates } from "../hooks/useFlowDates";
import { useFlowMetadata } from "../hooks/useFlowMetadata";
import { useFlowSortDisplay } from "../hooks/useFlowSortDisplay";
import { FlowRowLink } from "./styles";
import {
  FlowActionsCell,
  FlowStatusCell,
  FlowTitleCell,
  StyledTable,
  StyledTableHead,
  StyledTableRow,
} from "./styles";

interface FlowTableProps {
  flows: FlowSummary[];
  teamId: number;
  teamSlug: string;
  refreshFlows: () => void;
  showDetails: boolean;
  updateFlow?: (flow: FlowSummary) => void;
}

export const FlowTable: React.FC<FlowTableProps> = ({
  flows,
  teamSlug,
  refreshFlows,
  showDetails,
  updateFlow,
}) => {
  const [userId] = useStore((state) => [state.user?.id]);
  const { headerText } = useFlowSortDisplay();

  const showPinnedColumn = updateFlow && userId;

  return (
    <StyledTable>
      <StyledTableHead>
        <TableRow>
          <FlowTitleCell>Flow title</FlowTitleCell>
          {showDetails && (
            <>
              <FlowStatusCell>Online status</FlowStatusCell>
              <FlowStatusCell>Flow type</FlowStatusCell>
              <TableCell>{headerText}</TableCell>
              {showPinnedColumn && <TableCell>Pinned</TableCell>}
              <FlowActionsCell align="center">Actions</FlowActionsCell>
            </>
          )}
        </TableRow>
      </StyledTableHead>
      <TableBody>
        {flows.map((flow) => (
          <FlowTableRow
            key={flow.slug}
            flow={flow}
            teamSlug={teamSlug}
            refreshFlows={refreshFlows}
            showDetails={showDetails}
            updateFlow={updateFlow}
          />
        ))}
      </TableBody>
    </StyledTable>
  );
};

interface FlowTableRowProps {
  flow: FlowSummary;
  teamSlug: string;
  refreshFlows: () => void;
  showDetails: boolean;
  updateFlow?: (flow: FlowSummary) => void;
}

const FlowTableRow: React.FC<FlowTableRowProps> = ({
  flow,
  teamSlug,
  refreshFlows,
  showDetails,
  updateFlow,
}) => {
  const [canUserEditTeam, userId] = useStore((state) => [
    state.canUserEditTeam,
    state.user?.id,
  ]);

  const {
    isSubmissionService,
    isAnyTemplate,
    isSourceTemplate,
    isTemplatedFlow,
    statusVariant,
  } = useFlowMetadata(flow);

  const { displayTimeAgo, displayActor } = useFlowDates(flow);

  const showPinnedColumn = updateFlow && userId;

  return (
    <StyledTableRow isTemplated={isAnyTemplate} clickable={showDetails}>
      <FlowTitleCell>
        <Box>
          {isAnyTemplate && (
            <Box sx={{ mb: 0.5 }}>
              <FlowTemplateIndicator
                isSourceTemplate={isSourceTemplate}
                isTemplatedFlow={isTemplatedFlow}
                teamName={flow.template?.team.name}
              />
            </Box>
          )}
          <Typography variant="h4" component="span">
            {flow.name}
          </Typography>
          {showDetails && (
            <FlowRowLink
              to="/app/$team/$flow"
              params={{ team: teamSlug, flow: flow.slug }}
              aria-label={flow.name}
              preload={false}
            />
          )}
          {flow.summary && (
            <TruncatedText
              variant="body2"
              color="textSecondary"
              lineClamp={2}
              pt={0.5}
            >
              {flow.summary}
            </TruncatedText>
          )}
        </Box>
      </FlowTitleCell>
      {showDetails && (
        <>
          <FlowStatusCell>
            <Box sx={{ display: "inline-flex" }}>
              <FlowTag
                tagType={FlowTagType.Status}
                statusVariant={statusVariant}
              >
                {statusVariant}
              </FlowTag>
            </Box>
          </FlowStatusCell>
          <FlowStatusCell>
            {isSubmissionService && (
              <Box sx={{ display: "inline-flex" }}>
                <FlowTag tagType={FlowTagType.ServiceType}>Submission</FlowTag>
              </Box>
            )}
          </FlowStatusCell>
          <TableCell>
            <Box>
              <Typography variant="body2">{displayTimeAgo}</Typography>
              {displayActor && (
                <Typography variant="body2" color="textSecondary">
                  by {displayActor}
                </Typography>
              )}
            </Box>
          </TableCell>
          {showPinnedColumn && (
            <TableCell>
              <Box onClick={(e) => e.stopPropagation()} sx={{ textAlign: "center" }}>
                {userId && updateFlow && (
                  <FlowPinButton
                    flowId={flow.id}
                    userId={userId}
                    isPinnedByCurrentUser={flow.pinnedFlows.length > 0}
                    updateFlow={updateFlow}
                  />
                )}
              </Box>
            </TableCell>
          )}
          <FlowActionsCell
            className="actions-cell"
            align="center"
            onClick={(e) => e.stopPropagation()}
          >
            {canUserEditTeam(teamSlug) && (
              <FlowMenu
                flow={flow}
                refreshFlows={refreshFlows}
                isAnyTemplate={isAnyTemplate}
                variant="table"
              />
            )}
          </FlowActionsCell>
        </>
      )}
    </StyledTableRow>
  );
};
