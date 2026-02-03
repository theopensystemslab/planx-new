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
import ListItem from "@mui/material/ListItem";
import Link from "@mui/material/Link";

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
  refetch
}: EditorModalProps) => {
  const toast = useToast();
  const [deleteEmail] = useMutation(DELETE_TEAM_SUBMISSION_INTEGRATIONS);
  const emailId = initialValues?.id || null;
  console.log({ emailId });
  const { data, error } = useQuery<GetFlowsWithSubmissionIntegration>(
    GET_FLOWS_WITH_SUBMISSION_INTEGRATION,
    {
      variables: { emailId },
    }
  );
  console.log({ data });

  // The GET query returns deleted flows, so filter for existing flows here
  const usedFlows = data?.flowIntegrations
    .filter((integration) => integration.flow)
    .map((integration) => ({
      slug: integration.flow?.slug,
      name: integration.flow?.name,
    })) || [];  
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
      refetch();
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
      <DialogTitle variant="h3" component="h1">
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
            <>
            <Typography mb={2}>
              This email address cannot be removed as it is currently used in the following flows: 
            </Typography>
              {usedFlows.map((flow) => (
                <ListItem key={flow.name}>
                  <Link
                      href="#" // TODO: update link after routing work merged; /{team}/{slug}
                      target="_blank"
                      rel="noopener noreferrer"
                    >{flow.name}
                  </Link>
                </ListItem>
              ))}
            <Typography mt={2}>
            Please update the flow settings to use a
              different email address before removing this one.
            </Typography>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          color="secondary"
          variant="contained" 
          onClick={() => setShowModal(false)}
          >
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
