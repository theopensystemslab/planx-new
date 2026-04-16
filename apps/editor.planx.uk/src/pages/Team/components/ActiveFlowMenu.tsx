import MoreHoriz from "@mui/icons-material/MoreHoriz";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useToast } from "hooks/useToast";
import React, { useState } from "react";
import SimpleMenu from "ui/editor/SimpleMenu";

import { ArchiveDialog } from "./ArchiveDialog";
import { CopyDialog } from "./CopyDialog";
import { useArchiveFlow } from "./hooks/useArchiveFlow";
import { MoveDialog } from "./MoveDialog";
import { RenameDialog } from "./RenameDialog";
import { FlowMenuProps, StyledSimpleMenu } from "./StyledSimpleMenu";

const ActiveFlowMenu: React.FC<FlowMenuProps> = ({
  flow,
  isAnyTemplate,
  variant = "card",
  teamId,
  userId,
}) => {
  type OpenDialog = "archive" | "copy" | "rename" | "move";
  const [openDialog, setOpenDialog] = useState<OpenDialog | null>(null);
  const [archiveFlow] = useArchiveFlow(flow.id, flow.slug, teamId, userId);

  const toast = useToast();

  const handleClose = () => {
    setOpenDialog(null);
  };

const handleArchive = async () => {
  try {
    await archiveFlow();
    toast.success("Archived flow");
  } catch (error) {
    toast.error(
      "We are unable to archive this flow, refesh and try again or contact an admin",
    );
  } finally {
    setOpenDialog(null);
  }
};

  const menuItems = [
    {
      label: "Rename",
      onClick: () => setOpenDialog("rename"),
    },
    {
      label: "Make a copy",
      onClick: () => setOpenDialog("copy"),
      disabled: isAnyTemplate,
    },
    {
      label: "Move",
      onClick: () => setOpenDialog("move"),
    },
    {
      label: "Archive",
      onClick: () => setOpenDialog("archive"),
    },
  ];

  return (
    <>
      {openDialog === "archive" && (
        <ArchiveDialog
          title={`Archive "${flow.name}"`}
          open={openDialog === "archive"}
          content={`Are you sure you want to archive "${flow.name}"? Once archived, a flow is no longer able to be viewed in the editor.`}
          handleClose={handleClose}
          onConfirm={handleArchive}
          submitLabel="Archive this flow"
        />
      )}
      {openDialog === "copy" && (
        <CopyDialog
          isDialogOpen={openDialog === "copy"}
          handleClose={handleClose}
          sourceFlow={{
            name: flow.name,
            slug: flow.slug,
            id: flow.id,
          }}
        />
      )}
      {openDialog === "rename" && (
        <RenameDialog
          isDialogOpen={openDialog === "rename"}
          handleClose={handleClose}
          flow={{
            name: flow.name,
            slug: flow.slug,
            id: flow.id,
          }}
        />
      )}
      {openDialog === "move" && (
        <MoveDialog
          isDialogOpen={openDialog === "move"}
          handleClose={handleClose}
          sourceFlow={{
            name: flow.name,
            slug: flow.slug,
            id: flow.id,
          }}
        />
      )}

      {variant === "card" ? (
        <StyledSimpleMenu items={menuItems}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.2 }}>
            <MoreHoriz sx={{ fontSize: "1.4em" }} />
            <Typography variant="body2" fontSize="small">
              <strong>Menu</strong>
            </Typography>
          </Box>
        </StyledSimpleMenu>
      ) : (
        <SimpleMenu items={menuItems} />
      )}
    </>
  );
};

export default ActiveFlowMenu;
