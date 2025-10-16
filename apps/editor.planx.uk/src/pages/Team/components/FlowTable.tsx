import StarIcon from "@mui/icons-material/Star";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import React from "react";
import { Link, useCurrentRoute, useNavigation } from "react-navi";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import FlowTag from "ui/editor/FlowTag/FlowTag";
import { FlowTagType } from "ui/editor/FlowTag/types";
import SimpleMenu from "ui/editor/SimpleMenu";
import { getSortParams } from "ui/editor/SortControl/utils";

import {
  formatLastEditMessage,
  formatLastPublishMessage,
} from "../../FlowEditor/utils";
import { sortOptions } from "../helpers/sortAndFilterOptions";
import { FlowDialogs } from "./FlowDialogs";
import { useFlowActions } from "./hooks/useFlowActions";

const StyledTable = styled(Table)(({ theme }) => ({
  marginTop: theme.spacing(2),
  zIndex: 1,
  position: "sticky",
  top: 0,
  border: `1px solid ${theme.palette.border.main}`,
  "& .MuiTableCell-root": {
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${theme.palette.border.main}`,
  },
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  "& .MuiTableCell-head": {
    backgroundColor: theme.palette.background.default,
    borderBottom: `1px solid ${theme.palette.border.main}`,
    "&:last-of-type": {
      borderLeft: `1px solid ${theme.palette.border.main}`,
    },
  },
}));

const StyledTableRow = styled(TableRow, {
  shouldForwardProp: (prop) => prop !== "isTemplated",
})<{ isTemplated?: boolean }>(({ theme, isTemplated }) => ({
  backgroundColor: isTemplated
    ? theme.palette.template.light
    : theme.palette.background.default,
  cursor: "pointer",
  "&:hover": {
    backgroundColor: isTemplated
      ? theme.palette.template.main
      : theme.palette.background.paper,
    "& a": {
      textDecoration: "underline",
    },
  },
  "&:has(.actions-cell:hover) a": {
    textDecoration: "none",
  },
}));

const FlowTitleCell = styled(TableCell)(() => ({
  width: "45%",
  minWidth: "240px",
}));

const FlowStatusCell = styled(TableCell)(() => ({
  width: "11%",
  minWidth: "150px",
}));

const FlowActionsCell = styled(TableCell)(({ theme }) => ({
  width: "5%",
  maxWidth: "100px",
  backgroundColor: theme.palette.background.paper,
  borderLeft: `1px solid ${theme.palette.border.main}`,
}));

const FlowLink = styled(Link)(({ theme }) => ({
  textDecoration: "none",
  color: theme.palette.text.primary,
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  "&:hover": {
    textDecoration: "underline",
  },
}));

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
  return (
    <StyledTable>
      <StyledTableHead>
        <TableRow>
          <FlowTitleCell>Flow title</FlowTitleCell>
          <FlowStatusCell>Online status</FlowStatusCell>
          <FlowStatusCell>Flow type</FlowStatusCell>
          <TableCell>Last edited</TableCell>
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
  const route = useCurrentRoute();
  const navigation = useNavigation();

  // All shared logic in one hook!
  const {
    isArchiveDialogOpen,
    setIsArchiveDialogOpen,
    isCopyDialogOpen,
    isRenameDialogOpen,
    handleArchive,
    handleCopyDialogClose,
    handleRenameDialogClose,
    isSubmissionService,
    isTemplatedFlow,
    isSourceTemplate,
    isAnyTemplate,
    statusVariant,
    menuItems,
    canUserEditTeam,
  } = useFlowActions(flow, teamSlug, refreshFlows);

  const {
    sortObject: { displayName: sortDisplayName },
  } = getSortParams<FlowSummary>(route.url.query, sortOptions);

  const handleRowClick = () => {
    navigation.navigate(`./${teamSlug}/${flow.slug}`);
  };

  const editedDateMessage = formatLastEditMessage(
    flow.operations[0]?.createdAt,
    flow.operations[0]?.actor,
  );

  const publishedDate = formatLastPublishMessage(
    flow.publishedFlows[0]?.publishedAt,
  );

  const editedDateParts = editedDateMessage.split(" by ");
  const editedTimeAgo = editedDateParts[0];
  const editedActor = editedDateParts[1];

  const publishedDateParts = publishedDate?.split(" by ") || [];
  const publishedTimeAgo = publishedDateParts[0];
  const publishedActor = publishedDateParts[1];

  const isShowingPublished = sortDisplayName?.toLowerCase().includes("publish");
  const displayTimeAgo = isShowingPublished ? publishedTimeAgo : editedTimeAgo;
  const displayActor = isShowingPublished ? publishedActor : editedActor;

  let templateDisplay = "";
  if (isSourceTemplate) {
    templateDisplay = "Source template";
  } else if (isTemplatedFlow) {
    templateDisplay = flow.template.team.name;
  }

  return (
    <>
      <FlowDialogs
        flow={flow}
        isArchiveDialogOpen={isArchiveDialogOpen}
        setIsArchiveDialogOpen={setIsArchiveDialogOpen}
        isCopyDialogOpen={isCopyDialogOpen}
        isRenameDialogOpen={isRenameDialogOpen}
        handleArchive={handleArchive}
        handleCopyDialogClose={handleCopyDialogClose}
        handleRenameDialogClose={handleRenameDialogClose}
      />
      <StyledTableRow isTemplated={isAnyTemplate} onClick={handleRowClick}>
        <FlowTitleCell>
          <Box>
            {templateDisplay && (
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
                <Typography variant="body2">{templateDisplay}</Typography>
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
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ mt: 0.5 }}
              >
                {(() => {
                  const words = flow.summary.split(" ");
                  const trimmed = words.slice(0, 16).join(" ");
                  return words.length > 16 ? `${trimmed}...` : trimmed;
                })()}
              </Typography>
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
          {canUserEditTeam && <SimpleMenu items={menuItems}></SimpleMenu>}
        </FlowActionsCell>
      </StyledTableRow>
    </>
  );
};
