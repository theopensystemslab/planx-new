import MoreHoriz from "@mui/icons-material/MoreHoriz";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useToast } from "hooks/useToast";
import { useStore } from "pages/FlowEditor/lib/store";
import { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import React, { useState } from "react";
import SimpleMenu from "ui/editor/SimpleMenu";

import { ArchiveDialog } from "./ArchiveDialog";
import { CopyDialog } from "./CopyDialog";
import { MoveDialog } from "./MoveDialog";
import { RenameDialog } from "./RenameDialog";

export const StyledSimpleMenu = styled(SimpleMenu)(({ theme }) => ({
  display: "flex",
  marginTop: "auto",
  borderTop: `1px solid ${theme.palette.border.light}`,
  backgroundColor: theme.palette.background.paper,
  overflow: "hidden",
  borderRadius: "0px 0px 4px 4px",
  maxHeight: "35px",
  "& > button": {
    padding: theme.spacing(0.25, 1),
    width: "100%",
    justifyContent: "flex-start",
    "& > svg": {
      display: "none",
    },
  },
}));

interface Props {
  flow: FlowSummary;
  refreshFlows: () => void;
  isAnyTemplate: boolean;
  variant?: "card" | "table";
}

const FlowMenu: React.FC<Props> = ({
  flow,
  refreshFlows,
  isAnyTemplate,
  variant = "card",
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
      setOpenDialog(null);
      toast.success("Archived flow");
    } catch (error) {
      toast.error(
        "We are unable to archive this flow, refesh and try again or contact an admin",
      );
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

export default FlowMenu;
