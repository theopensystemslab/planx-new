import { useMutation, useQuery } from "@apollo/client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { useToast } from "hooks/useToast";
import React from "react";

import {
  DELETE_TEAM_SUBMISSION_INTEGRATIONS,
  GET_FLOWS_WITH_SUBMISSION_INTEGRATION,
} from "./queries";
import {
  EditorModalProps,
  GetFlowsWithSubmissionIntegration,
  SubmissionEmailInput,
} from "./types";

export const RemoveEmailModal = ({
  setShowModal,
  showModal,
  actionType,
  initialValues,
  teamId,
}: EditorModalProps) => {
  const toast = useToast();
  const [deleteEmail] = useMutation(DELETE_TEAM_SUBMISSION_INTEGRATIONS);
  const emailId = initialValues?.id || null;
  console.log({ emailId });
  const { data } = useQuery<GetFlowsWithSubmissionIntegration>(
    GET_FLOWS_WITH_SUBMISSION_INTEGRATION,
    {
      variables: { emailId },
    },
  );
  console.log({ data });
  const usedFlows = data?.flowIntegrations || [];
  console.log({ usedFlows });
  const deletable = usedFlows.length === 0 ? true : false;
  console.log({ deletable });

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
          {deletable ? (
            <Typography mb={2}>
              Are you sure you want to remove the email address "
              {initialValues?.submissionEmail}" from receiving submissions?
            </Typography>
          ) : (
            <Typography mb={2} color="error">
              This email address cannot be removed as it is currently in use by
              one or more flows. Please update the flow settings to use a
              different email before removing this one.
            </Typography>
          )}
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
          disabled={!deletable}
        >
          Remove Email
        </Button>
      </DialogActions>
    </Dialog>
  );
};
