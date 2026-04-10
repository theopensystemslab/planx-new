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
}

export const FlowTable: React.FC<FlowTableProps> = ({
  flows,
  teamSlug,
  refreshFlows,
  showDetails,
}) => {
  const { headerText } = useFlowSortDisplay();

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
}

const FlowTableRow: React.FC<FlowTableRowProps> = ({
  flow,
  teamSlug,
  refreshFlows,
  showDetails,
}) => {
  const [canUserEditTeam] = useStore((state) => [state.canUserEditTeam]);

  const {
    isSubmissionService,
    isAnyTemplate,
    isSourceTemplate,
    isTemplatedFlow,
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
