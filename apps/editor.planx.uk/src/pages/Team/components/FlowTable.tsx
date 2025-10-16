import StarIcon from "@mui/icons-material/Star";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useToast } from "hooks/useToast";
import React, { useState } from "react";
import { Link, useCurrentRoute, useNavigation } from "react-navi";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import FlowTag from "ui/editor/FlowTag/FlowTag";
import { FlowTagType, StatusVariant } from "ui/editor/FlowTag/types";
import { getSortParams } from "ui/editor/SortControl/utils";
import { slugify } from "utils";

import SimpleMenu from "../../../ui/editor/SimpleMenu";
import { useStore } from "../../FlowEditor/lib/store";
import { FlowSummary } from "../../FlowEditor/lib/store/editor";
import {
  formatLastEditMessage,
  formatLastPublishMessage,
} from "../../FlowEditor/utils";
import { sortOptions } from "../helpers/sortAndFilterOptions";
import { ArchiveDialog } from "./ArchiveDialog";
import { CopyDialog } from "./CopyDialog";
import { RenameDialog } from "./RenameDialog";

const StyledTable = styled(Table)(({ theme }) => ({
  marginTop: theme.spacing(2),
  zIndex: 1,
  position: "sticky",
  top: 0,
  border: `1px solid ${theme.palette.border.main}`,
  borderRadius: theme.shape.borderRadius,
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
}));

const FlowTitleCell = styled(TableCell)(() => ({
  width: "30%",
  minWidth: "200px",
}));

const FlowActionsCell = styled(TableCell)(({ theme }) => ({
  width: "100px",
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
          <TableCell>Online status</TableCell>
          <TableCell>Flow type</TableCell>
          <TableCell>Template</TableCell>
          <TableCell>Last edited</TableCell>
          <TableCell align="center">Actions</TableCell>
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
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);

  const [archiveFlow, moveFlow, canUserEditTeam] = useStore((state) => [
    state.archiveFlow,
    state.moveFlow,
    state.canUserEditTeam,
  ]);

  const route = useCurrentRoute();
  const navigation = useNavigation();
  const toast = useToast();

  const {
    sortObject: { displayName: sortDisplayName },
  } = getSortParams<FlowSummary>(route.url.query, sortOptions);

  const handleRowClick = () => {
    navigation.navigate(`./${teamSlug}/${flow.slug}`);
  };

  const handleCopyDialogClose = () => {
    setIsCopyDialogOpen(false);
    refreshFlows();
  };

  const handleRenameDialogClose = () => {
    setIsRenameDialogOpen(false);
    refreshFlows();
  };

  const handleArchive = async () => {
    try {
      await archiveFlow(flow);
      refreshFlows();
      toast.success("Archived flow");
    } catch (error) {
      toast.error(
        "We are unable to archive this flow, refesh and try again or contact an admin",
      );
    }
  };

  const handleMove = (newTeam: string) => {
    moveFlow(flow.id, newTeam, flow.name).then(() => {
      refreshFlows();
    });
  };

  const isSubmissionService = flow.publishedFlows?.[0]?.hasSendComponent;
  const isTemplatedFlow = Boolean(flow.templatedFrom);
  const isSourceTemplate = flow.isTemplate;
  const isAnyTemplate = isTemplatedFlow || isSourceTemplate;

  const statusVariant =
    flow.status === "online" ? StatusVariant.Online : StatusVariant.Offline;

  // After your existing date formatting:
  const editedDateMessage = formatLastEditMessage(
    flow.operations[0]?.createdAt,
    flow.operations[0]?.actor,
  );

  const publishedDate = formatLastPublishMessage(
    flow.publishedFlows[0]?.publishedAt,
  );

  // Split both messages for two-line display
  const editedDateParts = editedDateMessage.split(" by ");
  const editedTimeAgo = editedDateParts[0];
  const editedActor = editedDateParts[1];

  const publishedDateParts = publishedDate?.split(" by ") || [];
  const publishedTimeAgo = publishedDateParts[0];
  const publishedActor = publishedDateParts[1];

  // Determine which date to show based on sort option
  const isShowingPublished = sortDisplayName?.toLowerCase().includes("publish");

  const displayTimeAgo = isShowingPublished ? publishedTimeAgo : editedTimeAgo;
  const displayActor = isShowingPublished ? publishedActor : editedActor;

  let templateDisplay = "";
  if (isSourceTemplate) {
    templateDisplay = "Open Systems Lab";
  } else if (isTemplatedFlow) {
    templateDisplay = flow.template.team.name;
  }

  return (
    <>
      {isArchiveDialogOpen && (
        <ArchiveDialog
          title={`Archive "${flow.name}"`}
          open={isArchiveDialogOpen}
          content={`Are you sure you want to archive "${flow.name}"? Once archived, a flow is no longer able to be viewed in the editor and can only be restored by a developer.`}
          onClose={() => setIsArchiveDialogOpen(false)}
          onConfirm={handleArchive}
          submitLabel="Archive this flow"
        />
      )}
      {isCopyDialogOpen && (
        <CopyDialog
          isDialogOpen={isCopyDialogOpen}
          handleClose={handleCopyDialogClose}
          sourceFlow={{
            name: flow.name,
            slug: flow.slug,
            id: flow.id,
          }}
        />
      )}
      {isRenameDialogOpen && (
        <RenameDialog
          isDialogOpen={isRenameDialogOpen}
          handleClose={handleRenameDialogClose}
          flow={{
            name: flow.name,
            slug: flow.slug,
            id: flow.id,
          }}
        />
      )}
      <StyledTableRow isTemplated={isAnyTemplate} onClick={handleRowClick}>
        <FlowTitleCell>
          <Box>
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
                {`${flow.summary.split(" ").slice(0, 20).join(" ")}...`}
              </Typography>
            )}
          </Box>
        </FlowTitleCell>
        <TableCell>
          <Box sx={{ display: "inline-flex" }}>
            <FlowTag tagType={FlowTagType.Status} statusVariant={statusVariant}>
              {statusVariant}
            </FlowTag>
          </Box>
        </TableCell>
        <TableCell>
          {isSubmissionService && (
            <Box sx={{ display: "inline-flex" }}>
              <FlowTag tagType={FlowTagType.ServiceType}>Submission</FlowTag>
            </Box>
          )}
        </TableCell>
        <TableCell>
          {templateDisplay && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <StarIcon sx={{ fontSize: "0.9em", color: "#380F77" }} />
              <Typography variant="body2">{templateDisplay}</Typography>
            </Box>
          )}
        </TableCell>
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
        <FlowActionsCell align="center" onClick={(e) => e.stopPropagation()}>
          {canUserEditTeam(teamSlug) && (
            <SimpleMenu
              items={[
                {
                  label: "Rename",
                  onClick: () => setIsRenameDialogOpen(true),
                },
                {
                  label: "Copy",
                  onClick: () => setIsCopyDialogOpen(true),
                  disabled: isAnyTemplate,
                },
                {
                  label: "Move",
                  onClick: () => {
                    const newTeam = prompt("New team");
                    if (newTeam) {
                      if (slugify(newTeam) === teamSlug) {
                        alert(
                          `This flow already belongs to ${teamSlug}, skipping move`,
                        );
                      } else {
                        handleMove(slugify(newTeam));
                      }
                    }
                  },
                },
                {
                  label: "Archive",
                  onClick: () => setIsArchiveDialogOpen(true),
                },
              ]}
            ></SimpleMenu>
          )}
        </FlowActionsCell>
      </StyledTableRow>
    </>
  );
};
