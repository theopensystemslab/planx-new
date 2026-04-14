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
}) => {
  type OpenFlowDialog = "archive" | "copy" | "rename" | "move";
  const [openFlowDialog, setOpenFlowDialog] = useState<OpenFlowDialog | null>(null);
  const [archiveFlow] = useArchiveFlow(flow.id, flow.slug, teamId);

  const toast = useToast();

  const handleClose = () => {
    setOpenFlowDialog(null);
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
    setOpenFlowDialog(null);
  }
};

  const menuItems = [
    {
      label: "Rename",
      onClick: () => setOpenFlowDialog("rename"),
    },
    {
      label: "Make a copy",
      onClick: () => setOpenFlowDialog("copy"),
      disabled: isAnyTemplate,
    },
    {
      label: "Move",
      onClick: () => setOpenFlowDialog("move"),
    },
    {
      label: "Archive",
      onClick: () => setOpenFlowDialog("archive"),
    },
  ];

  return (
    <>
      {openFlowDialog === "archive" && (
        <ArchiveDialog
          title={`Archive "${flow.name}"`}
          open={openFlowDialog === "archive"}
          content={`Are you sure you want to archive "${flow.name}"? Once archived, a flow is no longer able to be viewed in the editor.`}
          handleClose={handleClose}
          onConfirm={handleArchive}
          submitLabel="Archive this flow"
        />
      )}
      {openFlowDialog === "copy" && (
        <CopyDialog
          isDialogOpen={openFlowDialog === "copy"}
          handleClose={handleClose}
          sourceFlow={{
            name: flow.name,
            slug: flow.slug,
            id: flow.id,
          }}
        />
      )}
      {openFlowDialog === "rename" && (
        <RenameDialog
          isDialogOpen={openFlowDialog === "rename"}
          handleClose={handleClose}
          flow={{
            name: flow.name,
            slug: flow.slug,
            id: flow.id,
          }}
        />
      )}
      {openFlowDialog === "move" && (
        <MoveDialog
          isDialogOpen={openFlowDialog === "move"}
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
