import { useMutation } from "@apollo/client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { useToast } from "hooks/useToast";
import React from "react";

import { DELETE_TEAM_SUBMISSION_INTEGRATIONS } from "./queries";
import { EditorModalProps, SubmissionEmailInput } from "./types";

export const RemoveEmailModal = ({
  setShowModal,
  showModal,
  actionType,
  initialValues,
  teamId,
}: EditorModalProps) => {
  const toast = useToast();
  const [deleteEmail] = useMutation(DELETE_TEAM_SUBMISSION_INTEGRATIONS);

  const handleRemoveEmail = async (email: SubmissionEmailInput) => {
    if (!email?.id) {
      return;
    }
    try {
      await deleteEmail({
        variables: { submissionEmail: email.submissionEmail, teamId },
        optimisticResponse: {
          delete_submission_integrations: {
            returning: [{ ...email }],
          },
        },
      });
      setShowModal(false);
      toast.success("Email removed successfully");
    } catch (error) {
      console.error("Error deleting email:", error);
      toast.error("Failed to remove email");
    }
  };

  return (
    <Dialog
      aria-labelledby="dialog-heading"
      data-testid={`modal-${actionType}-email`}
      open={showModal || false}
      onClose={() => setShowModal(false)}
      fullWidth
    >
      <DialogTitle variant="h3" component="h1" id="dialog-heading">
        Remove an email
      </DialogTitle>
      <DialogContent>
        <Box mt={2}>
          <Typography mb={2}>
            Are you sure you want to remove the email address "
            {initialValues?.submissionEmail}" from receiving submissions?
          </Typography>
          <Typography>
            It will be removed from live services. Any services sending
            applications to this destination will fall back to your default
            email.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={() => setShowModal(false)}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={() => initialValues && handleRemoveEmail(initialValues)}
          data-testid="confirm-remove-email-button"
        >
          Remove Email
        </Button>
      </DialogActions>
    </Dialog>
  );
};
