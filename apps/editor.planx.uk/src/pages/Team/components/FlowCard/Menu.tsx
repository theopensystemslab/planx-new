import MoreHoriz from "@mui/icons-material/MoreHoriz";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useToast } from "hooks/useToast"; 
import { useStore } from "pages/FlowEditor/lib/store";
import { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import React, { useState } from "react";

import { ArchiveDialog } from "../ArchiveDialog";
import { CopyDialog } from "../CopyDialog";
import { MoveDialog } from "../MoveDialog";
import { RenameDialog } from "../RenameDialog";
import { StyledSimpleMenu } from "./styles";

interface Props {
  flow: FlowSummary;
  refreshFlows: () => void;
  isAnyTemplate: boolean;
}

const FlowCardMenu: React.FC<Props> = ({ flow, refreshFlows, isAnyTemplate }) => {
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] =
    useState<boolean>(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState<boolean>(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState<boolean>(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState<boolean>(false);

  const archiveFlow = useStore((state) => state.archiveFlow);

  const toast = useToast();

  const handleCopyDialogClose = () => {
    setIsCopyDialogOpen(false);
    refreshFlows();
  };

  const handleRenameDialogClose = () => {
    setIsRenameDialogOpen(false);
    refreshFlows();
  };

  const handleMoveDialogClose = () => {
    setIsMoveDialogOpen(false);
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

  return (
    <>
      {isArchiveDialogOpen && (
        <ArchiveDialog
          title={`Archive "${flow.name}"`}
          open={isArchiveDialogOpen}
          content={`Are you sure you want to archive "${flow.name}"? Once archived, a flow is no longer able to be viewed in the editor and can only be restored by a developer.`}
          onClose={() => {
            setIsArchiveDialogOpen(false);
          }}
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
      {isMoveDialogOpen && (
        <MoveDialog
          isDialogOpen={isMoveDialogOpen}
          handleClose={handleMoveDialogClose}
          sourceFlow={{
            name: flow.name,
            slug: flow.slug,
            id: flow.id,
          }}
        />
      )}

      <StyledSimpleMenu
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
            onClick: () => setIsMoveDialogOpen(true),
          },
          {
            label: "Archive",
            onClick: () => setIsArchiveDialogOpen(true),
          },
        ]}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.2 }}>
          <MoreHoriz sx={{ fontSize: "1.4em" }} />
          <Typography variant="body2" fontSize="small">
            <strong>Menu</strong>
          </Typography>
        </Box>
      </StyledSimpleMenu>
    </>
  )
}

export default FlowCardMenu;