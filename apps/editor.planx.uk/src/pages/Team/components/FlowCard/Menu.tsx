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

const FlowCardMenu: React.FC<Props> = ({
  flow,
  refreshFlows,
  isAnyTemplate,
}) => {
  type OpenDialog = "archive" | "copy" | "rename" | "move";
  const [openDialog, setOpenDialog] = useState<OpenDialog | null>(null);

  const archiveFlow = useStore((state) => state.archiveFlow);

  const toast = useToast();

  const handleClose = () => {
    setOpenDialog(null);
    refreshFlows();
  };

  const handleArchive = async () => {
    try {
      await archiveFlow(flow);
      toast.success("Archived flow");
    } catch (error) {
      toast.error(
        "We are unable to archive this flow, refesh and try again or contact an admin",
      );
    }
  };

  return (
    <>
      {openDialog === "archive" && (
        <ArchiveDialog
          title={`Archive "${flow.name}"`}
          open={openDialog === "archive"}
          content={`Are you sure you want to archive "${flow.name}"? Once archived, a flow is no longer able to be viewed in the editor and can only be restored by a developer.`}
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

      <StyledSimpleMenu
        items={[
          {
            label: "Rename",
            onClick: () => setOpenDialog("rename"),
          },
          {
            label: "Copy",
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
  );
};

export default FlowCardMenu;
