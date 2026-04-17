import MoreHoriz from "@mui/icons-material/MoreHoriz";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useToast } from "hooks/useToast";
import React, { useState } from "react";
import SimpleMenu from "ui/editor/SimpleMenu";

import { ArchiveDialog } from "./ArchiveDialog";
import { useUnarchiveFlow } from "./hooks/useUnarchiveFlow";
import { FlowMenuProps } from "./StyledSimpleMenu";
import { StyledSimpleMenu } from "./StyledSimpleMenu";

const ArchivedFlowMenu: React.FC<FlowMenuProps> = ({
    flow,
    variant = "card",
    teamId,
}) => {
    type OpenFlowDialog = "unarchive";
    const [openFlowDialog, setOpenFlowDialog] = useState<OpenFlowDialog | null>(null);
    const unarchivedSlug = flow.slug.replace("-archive", "");
    const [unarchiveFlow] = useUnarchiveFlow(flow.id, unarchivedSlug, teamId);

    const toast = useToast();

    const handleClose = () => {
        setOpenFlowDialog(null);
        };

    const handleUnarchive = async () => {
        try {
            await unarchiveFlow();
            toast.success("Unarchived flow");
        } catch (error) {
            toast.error(
            "We are unable to unarchive this flow, refesh and try again or contact an admin",
            );
        } finally {
            setOpenFlowDialog(null);
        }
        };

    const menuItems = [
        {
        label: "Unarchive",
        onClick: () => setOpenFlowDialog("unarchive"),
        },
    ];

return (
    <>
      {openFlowDialog === "unarchive" && (
        <ArchiveDialog
          title={`Unarchive "${flow.name}"`}
          open={openFlowDialog === "unarchive"}
          content={`Are you sure you want to unarchive "${flow.name}"?`}
          handleClose={handleClose}
          onConfirm={handleUnarchive}
          submitLabel="Unarchive this flow"
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
)};

export default ArchivedFlowMenu;