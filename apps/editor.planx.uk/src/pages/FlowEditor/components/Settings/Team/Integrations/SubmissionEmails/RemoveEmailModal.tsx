import { useMutation, useQuery } from "@apollo/client";
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

import {
  DELETE_TEAM_SUBMISSION_INTEGRATIONS,
  GET_FLOW_IDS_BY_SUBMISSION_INTEGRATION,
  GET_FLOWS,
} from "./queries";
import {
  EditorModalProps,
  GetFlowIdsBySubmissionIntegration,
  GetFlows,
  SubmissionEmailInput,
} from "./types";

export const RemoveEmailModal = ({
  setShowModal,
  showModal,
  actionType,
  initialValues,
  refetch,
}: EditorModalProps) => {
  const toast = useToast();
  const [deleteEmail] = useMutation(DELETE_TEAM_SUBMISSION_INTEGRATIONS);
  const emailId = initialValues?.id || null;
  const { data: flowIdsData, error: flowIdsError } =
    useQuery<GetFlowIdsBySubmissionIntegration>(
      GET_FLOW_IDS_BY_SUBMISSION_INTEGRATION,
      {
        variables: { emailId },
      },
    );

  const flowIds = flowIdsData?.flowIds.map((flow) => flow.flowId) || [];

  const { data: flowsData, error: flowsError } = useQuery<GetFlows>(GET_FLOWS, {
    variables: { emailId, flowIds },
  });

  const { slug: teamSlug } = useStore((state) => state.getTeam());

  const usedFlows =
    flowsData?.flows.map((flow) => ({
      slug: flow.slug,
      name: flow.name,
      flowId: flow.id,
    })) || [];

  const deletable = usedFlows.length === 0;

  const handleRemoveEmail = async (email: SubmissionEmailInput) => {
    if (!email?.id) {
      return;
    }
    try {
      await deleteEmail({
        variables: { submissionEmailId: email.id },
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
