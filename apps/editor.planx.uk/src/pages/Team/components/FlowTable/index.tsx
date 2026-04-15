import Box from "@mui/material/Box";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import { FlowView } from "pages/Team";
import React from "react";
import FlowTag from "ui/editor/FlowTag/FlowTag";
import { FlowTagType } from "ui/editor/FlowTag/types";
import TruncatedText from "ui/editor/TruncatedText";

import { useStore } from "../../../FlowEditor/lib/store";
import ActiveFlowMenu from "../ActiveFlowMenu";
import ArchivedFlowMenu from "../ArchivedFlowMenu";
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
  updateFlow?: (flow: FlowSummary) => void;
  view: FlowView;
}

export const FlowTable: React.FC<FlowTableProps> = ({
  flows,
  teamSlug,
  refreshFlows,
  updateFlow,
  view,
}) => {
  const [userId] = useStore((state) => [state.user?.id]);
  const { headerText } = useFlowSortDisplay();

  const showPinnedColumn = updateFlow && userId;

  return (
    <StyledTable>
      <StyledTableHead>
        <TableRow>
          <FlowTitleCell>Flow title</FlowTitleCell>
          {view === "flows" && (
            <>
              <FlowStatusCell>Online status</FlowStatusCell>
              <FlowStatusCell>Flow type</FlowStatusCell>
              <TableCell>{headerText}</TableCell>
              {showPinnedColumn && <TableCell>Pinned</TableCell>}
            </>
          )}
          <FlowActionsCell align="center">Actions</FlowActionsCell>
        </TableRow>
      </StyledTableHead>
      <TableBody>
        {flows.map((flow) => (
          <FlowTableRow
            key={flow.slug}
            flow={flow}
            teamSlug={teamSlug}
            refreshFlows={refreshFlows}
            view={view}
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
  view: FlowView;
  updateFlow?: (flow: FlowSummary) => void;
}

const FlowTableRow: React.FC<FlowTableRowProps> = ({
  flow,
  teamSlug,
  refreshFlows,
  view,
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
  const isRowLinkActive = view === "flows" ? true : false;

  const showPinnedColumn = updateFlow && userId;

  return (
    <StyledTableRow isTemplated={isAnyTemplate} clickable={isRowLinkActive}>
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
          {view === "flows" && (
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
      {view === "flows" && (
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
              <Box onClick={(e) => e.stopPropagation()}>
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
        </>
      )}
      {canUserEditTeam(teamSlug) && (
        <>
        <FlowActionsCell
          className="actions-cell"
          align="center"
          onClick={(e) => e.stopPropagation()}
        >
          {view === "flows" && (
            <ActiveFlowMenu
              flow={flow}
              refreshFlows={refreshFlows}
              isAnyTemplate={isAnyTemplate}
              variant="table"
            />
          )}

          {view === "archive" && (
            <ArchivedFlowMenu
              flow={flow}
              refreshFlows={refreshFlows}
              variant="table"
            />
          )}
        </FlowActionsCell>
      </>
    )}
    </StyledTableRow>
  );
};
