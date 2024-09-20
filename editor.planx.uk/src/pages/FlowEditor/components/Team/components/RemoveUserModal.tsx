import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import { useToast } from "hooks/useToast";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";

import { EditorModalProps } from "../types";
import { optimisticallyUpdateExistingMember } from "./lib/optimisticallyUpdateMembersTable";

export const RemoveUserModal = ({
  setShowModal,
  initialValues,
}: EditorModalProps) => {
  const toast = useToast();

  const removeUser = useStore.getState().deleteUser;
  const handleClick = async () => {
    console.log("handle click called");
    if (!initialValues?.id) {
      return;
    }
    const response = await removeUser(initialValues.id).catch((err) => {
      if (err.message === "Unable to remove user") {
        toast.error("Failed to remove new user, please try again");
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
    <>
      <DialogContent data-testid={"modal-remove-user"} sx={{ p: 2.5 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h3" component="h2" id="dialog-heading">
            Remove a user
          </Typography>
        </Box>
        <Box sx={{}}>
          <Typography variant="body1" component="p" id="dialog-body">
            {`Do you want to remove ${initialValues?.firstName} ${initialValues?.lastName}?`}
          </Typography>
          <br />
          <Typography variant="body1" component="p" id="dialog-body">
            {`The user will be moved to Archived Users and no longer have access to PlanX`}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          pl: 2.5,
          pb: 2.5,
        }}
      >
        <Box>
          <Button
            variant="contained"
            color="prompt"
            type="submit"
            data-testid={"modal-remove-user-button"}
            onClick={handleClick}
          >
            Remove user
          </Button>
          <Button
            variant="contained"
            color="secondary"
            type="reset"
            sx={{ ml: 1.5 }}
            onClick={() => setShowModal(false)}
            data-testid="modal-cancel-button"
          >
            Cancel
          </Button>
        </Box>
      </DialogActions>
    </>
  );
};
