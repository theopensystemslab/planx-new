import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { useToast } from "hooks/useToast";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import { EditorModalProps } from "../types";
import { optimisticallyUpdateExistingMember } from "./lib/optimisticallyUpdateMembersTable";

export const RemoveUserModal = ({
  setShowModal,
  showModal,
  actionType,
  initialValues,
}: EditorModalProps) => {
  const toast = useToast();

  const removeUser = useStore.getState().deleteUser;
  const handleClick = async () => {
    if (!initialValues?.id) {
      return;
    }
    const response = await removeUser(initialValues.id).catch((err) => {
      if (err.message === "Unable to remove user") {
        toast.error(
          `Failed to remove ${initialValues.firstName} ${initialValues.lastName}, try again`,
        );
      }
      console.error(err);
    });

    if (!response) {
      return;
    }
    optimisticallyUpdateExistingMember(
      { ...initialValues, email: null },
      initialValues.id,
    );
    setShowModal(false);
    toast.success(
      `Successfully removed ${initialValues.firstName} ${initialValues.lastName}`,
    );
  };

  return (
    <Dialog
      aria-labelledby="dialog-heading"
      data-testid={`modal-${actionType}-user`}
      open={showModal || false}
      onClose={() => setShowModal(false)}
      fullWidth
    >
      <DialogTitle variant="h3" component="h1" id="dialog-heading">
        Remove a user
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{}}>
          <Typography variant="body1" component="p" id="dialog-body">
            {`Do you want to remove ${initialValues?.firstName} ${initialValues?.lastName}?`}
          </Typography>
          <br />
          <Typography variant="body1" component="p" id="dialog-body">
            {`They will be moved to Archived Users and no longer have access to PlanX`}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="secondary"
          type="reset"
          sx={{ backgroundColor: "background.default" }}
          onClick={() => setShowModal(false)}
          data-testid="modal-cancel-button"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="warning"
          type="submit"
          data-testid={"modal-remove-user-button"}
          onClick={handleClick}
        >
          Remove user
        </Button>
      </DialogActions>
    </Dialog>
  );
};
