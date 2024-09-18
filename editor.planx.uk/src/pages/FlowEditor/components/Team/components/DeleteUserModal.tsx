import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import { FormikHelpers } from "formik";
import { useToast } from "hooks/useToast";
import React from "react";

import { AddNewEditorFormValues } from "../types";
import { useStore } from "pages/FlowEditor/lib/store";
import { deleteUser } from "@opensystemslab/planx-core";

export const DeleteUserModal = ({ showModal, setShowModal, initialValues }) => {
  const toast = useToast();
  console.log(initialValues.id);
  const { teamName, deleteUser } = useStore.getState();
  const handleClick = async () => {
    const response = await deleteUser(initialValues.id);
    if (!response) {
      toast.error("Failed to delete user, please try again");
      return;
    }

    toast.success("Successfully deleted user");
    setShowModal(false);
  };

  return (
    <Dialog
      aria-labelledby="dialog-heading"
      data-testid={"dialog-edit-user"}
      PaperProps={{
        sx: (theme) => ({
          width: "100%",
          maxWidth: theme.breakpoints.values.md,
          borderRadius: 0,
          borderTop: `20px solid ${theme.palette.primary.main}`,
          background: theme.palette.background.paper,
          margin: theme.spacing(2),
        }),
      }}
      open={showModal}
      onClose={() => setShowModal(false)}
    >
      <DialogContent data-testid={"modal-delete-user"} sx={{ p: 2.5 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h3" component="h2" id="dialog-heading">
            Delete a user
          </Typography>
        </Box>
        <Box sx={{}}>
          <Typography variant="body1" component="p" id="dialog-body">
            {`Do you want to delete ${initialValues.firstName} ${initialValues.lastName} from the ${teamName} team? `}
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
            data-testid={"modal-delete-user-button"}
            onClick={handleClick}
          >
            Delete user
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
    </Dialog>
  );
};
