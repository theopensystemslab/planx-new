import StarIcon from "@mui/icons-material/Star";
import Box from "@mui/material/Box";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import React from "react";
import { useNavigation } from "react-navi";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import FlowTag from "ui/editor/FlowTag/FlowTag";
import { FlowTagType, StatusVariant } from "ui/editor/FlowTag/types";
import TruncatedText from "ui/editor/TruncatedText";

import { useStore } from "../../../FlowEditor/lib/store";
import {
  formatLastEditMessage,
  formatLastPublishMessage,
} from "../../../FlowEditor/utils";
import FlowMenu from "../FlowMenu";
import { useFlowSortDisplay } from "../hooks/useFlowSortDisplay";
import {
  FlowActionsCell,
  FlowLink,
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
}

export const FlowTable: React.FC<FlowTableProps> = ({
  flows,
  teamSlug,
  refreshFlows,
}) => {
  const { headerText } = useFlowSortDisplay();

  return (
    <StyledTable>
      <StyledTableHead>
        <TableRow>
          <FlowTitleCell>Flow title</FlowTitleCell>
          <FlowStatusCell>Online status</FlowStatusCell>
          <FlowStatusCell>Flow type</FlowStatusCell>
          <TableCell>{headerText}</TableCell>
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
}

const FlowTableRow: React.FC<FlowTableRowProps> = ({
  flow,
  teamSlug,
  refreshFlows,
}) => {
  const navigation = useNavigation();
  const { showPublished } = useFlowSortDisplay();

  const [canUserEditTeam] = useStore((state) => [state.canUserEditTeam]);

  const isSubmissionService = flow.publishedFlows?.[0]?.hasSendComponent;
  const isTemplatedFlow = Boolean(flow.templatedFrom);
  const isSourceTemplate = flow.isTemplate;
  const isAnyTemplate = isTemplatedFlow || isSourceTemplate;

  const statusVariant =
    flow.status === "online" ? StatusVariant.Online : StatusVariant.Offline;

  const handleRowClick = () => {
    navigation.navigate(`./${teamSlug}/${flow.slug}`);
  };

  const editedDate = formatLastEditMessage(
    flow.operations[0]?.createdAt,
    flow.operations[0]?.actor,
  );

  const publishedDate = formatLastPublishMessage(
    flow.publishedFlows[0]?.publishedAt,
  );

  const displayTimeAgo = showPublished
    ? publishedDate.timeAgo
    : editedDate.timeAgo;
  const displayActor = showPublished ? publishedDate.actor : editedDate.actor;

  return (
    <StyledTableRow isTemplated={isAnyTemplate} onClick={handleRowClick}>
      <FlowTitleCell>
        <Box>
          {(isTemplatedFlow || isSourceTemplate) && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mb: 0.5,
              }}
            >
              {!isSourceTemplate && (
                <StarIcon sx={{ fontSize: "0.9em", color: "#380F77" }} />
              )}
              <Typography
                variant="body2"
                sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
              >
                {isSourceTemplate
                  ? "Source template"
                  : flow.template.team.name}
              </Typography>
            </Box>
          )}
          <FlowLink
            href={`./${flow.slug}`}
            prefetch={false}
            onClick={(e) => e.stopPropagation()}
          >
            <Typography variant="h4" component="span">
              {flow.name}
            </Typography>
          </FlowLink>
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
      <FlowStatusCell>
        <Box sx={{ display: "inline-flex" }}>
          <FlowTag tagType={FlowTagType.Status} statusVariant={statusVariant}>
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
    </StyledTableRow>
  );
};
