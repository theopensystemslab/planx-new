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
  FlowDateCell,
  FlowStatusCell,
  FlowTitleCell,
  SpacerTableRow,
  StyledTable,
  StyledTableHead,
  StyledTableRow,
} from "./styles";

interface FlowTableProps {
  flows?: FlowSummary[];
  pinnedFlows?: FlowSummary[];
  unpinnedFlows?: FlowSummary[];
  teamId: number;
  teamSlug: string;
  updateFlow?: (flow: FlowSummary) => void;
  view: FlowView;
}

export const FlowTable: React.FC<FlowTableProps> = ({
  flows,
  pinnedFlows,
  unpinnedFlows,
  teamSlug,
  view,
}) => {
  const { headerText } = useFlowSortDisplay();
  const showDetails = view === "flows";
  const useSplitLayout =
    pinnedFlows !== undefined && unpinnedFlows !== undefined;

  return (
    <StyledTable>
      <StyledTableHead>
        <TableRow>
          <FlowTitleCell>Flow title</FlowTitleCell>
          {view === "flows" && (
            <>
              <FlowStatusCell>Service status</FlowStatusCell>
              <FlowStatusCell>Flow type</FlowStatusCell>
              <FlowDateCell>{headerText}</FlowDateCell>
              {showDetails && <TableCell>Pinned</TableCell>}
            </>
          )}
          <FlowActionsCell align="center">Actions</FlowActionsCell>
        </TableRow>
      </StyledTableHead>
      <TableBody>
        {useSplitLayout ? (
          <>
            {pinnedFlows.map((flow) => (
              <FlowTableRow
                key={flow.slug}
                flow={flow}
                teamSlug={teamSlug}
                view={view}
                showDetails={showDetails}
              />
            ))}
            {pinnedFlows.length > 0 && (
              <SpacerTableRow>
                <TableCell colSpan={99} />
              </SpacerTableRow>
            )}
            {unpinnedFlows.map((flow) => (
              <FlowTableRow
                key={flow.slug}
                flow={flow}
                teamSlug={teamSlug}
                view={view}
                showDetails={showDetails}
              />
            ))}
          </>
        ) : (
          flows?.map((flow) => (
            <FlowTableRow
              key={flow.slug}
              flow={flow}
              teamSlug={teamSlug}
              view={view}
              showDetails={showDetails}
            />
          ))
        )}
      </TableBody>
    </StyledTable>
  );
};

interface FlowTableRowProps {
  flow: FlowSummary;
  teamSlug: string;
  view: FlowView;
  showDetails: boolean;
}

const FlowTableRow: React.FC<FlowTableRowProps> = ({
  flow,
  teamSlug,
  view,
  showDetails,
}) => {
  const [canUserEditTeam, teamId] = useStore((state) => [
    state.canUserEditTeam,
    state.teamId,
  ]);

  const {
    isSubmissionService,
    isAnyTemplate,
    isSourceTemplate,
    isTemplatedFlow,
    isService,
    statusVariant,
  } = useFlowMetadata(flow);

  const { displayTimeAgo, displayActor } = useFlowDates(flow);

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
              sx={{ pt: 0.5 }}
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
              {isService && (
                <FlowTag
                  tagType={FlowTagType.Status}
                  statusVariant={statusVariant}
                >
                  {statusVariant}
                </FlowTag>
              )}
            </Box>
          </FlowStatusCell>
          <FlowStatusCell>
            {isSubmissionService && isService && (
              <Box sx={{ display: "inline-flex" }}>
                <FlowTag tagType={FlowTagType.ServiceType}>Submission</FlowTag>
              </Box>
            )}
          </FlowStatusCell>
          <FlowDateCell>
            <Box>
              <Typography variant="body2">{displayTimeAgo}</Typography>
              {displayActor && (
                <Typography variant="body2" color="textSecondary">
                  by {displayActor}
                </Typography>
              )}
            </Box>
          </FlowDateCell>
          {showDetails && (
            <TableCell align="center">
              <Box onClick={(e) => e.stopPropagation()}>
                <FlowPinButton
                  flowId={flow.id}
                  teamId={teamId}
                  isPinnedByCurrentUser={flow.pinnedFlows.length > 0}
                />
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
                isAnyTemplate={isAnyTemplate}
                variant="table"
                teamId={teamId}
              />
            )}

            {view === "archive" && (
              <ArchivedFlowMenu flow={flow} variant="table" teamId={teamId} />
            )}
          </FlowActionsCell>
        </>
      )}
    </StyledTableRow>
  );
};
