import { useMutation } from "@apollo/client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Link from "@mui/material/Link";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import { useToast } from "hooks/useToast";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import { DELETE_TEAM_SUBMISSION_EMAILS } from "./queries";
import { EditorModalProps, SubmissionEmailWithFlows } from "./types";

export const RemoveEmailModal = ({
  modalState,
  setModalState,
  refetch,
}: EditorModalProps) => {
  const toast = useToast();
  const [deleteEmail] = useMutation(DELETE_TEAM_SUBMISSION_EMAILS);
  const { slug: teamSlug } = useStore((state) => state.getTeam());

  if (!modalState || modalState.type !== "delete") {
    throw new Error("RemoveEmailModal requires a delete modalState");
  }
  const usedFlows = modalState.email.flows;
  const deletable = usedFlows.length === 0;

  const handleRemoveEmail = async (
    submissionEmail: SubmissionEmailWithFlows,
  ) => {
    if (!submissionEmail?.id) {
      return;
    }
    try {
      await deleteEmail({
        variables: { submissionEmailId: submissionEmail.id },
        optimisticResponse: {
          delete_submission_emails: {
            returning: [{ ...submissionEmail }],
          },
        },
      });
      setModalState(null);
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
      data-testid={`modal-${modalState.type}-email`}
      open={true}
      onClose={() => setModalState(null)}
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
              {modalState.email.address}" from receiving
              submissions?
            </Typography>
          ) : (
            <>
              <Typography mb={2}>
                This email address cannot be removed as it is currently used in
                the following flows:
              </Typography>
              {usedFlows.map((flow) => (
                <ListItem key={flow.name}>
                  <Link
                    href={`/app/${teamSlug}/${flow.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {flow.name}
                  </Link>
                </ListItem>
              ))}
              <Typography mt={2}>
                Please <strong>update your Send component </strong>
                to use a different email address before removing this one.
              </Typography>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          color="secondary"
          variant="contained"
          onClick={() => setModalState(null)}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={() =>
            modalState.email && handleRemoveEmail(modalState.email)
          }
          data-testid="confirm-remove-email-button"
          disabled={!deletable}
        >
          Remove Email
        </Button>
      </DialogActions>
    </Dialog>
  );
};
