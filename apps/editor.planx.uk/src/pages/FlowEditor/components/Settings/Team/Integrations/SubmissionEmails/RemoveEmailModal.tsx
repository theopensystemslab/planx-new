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
  GET_LATEST_PUBLISHED_FLOWS,
} from "./queries";
import {
  EditorModalProps,
  GetFlowIdsBySubmissionIntegration,
  GetLatestPublishedFlows,
  SubmissionEmailInput,
} from "./types";

export const RemoveEmailModal = ({
  setShowModal,
  showModal,
  actionType,
  initialValues,
  teamId,
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

  const { data: latestFlowsData, error: latestFlowsError } =
    useQuery<GetLatestPublishedFlows>(GET_LATEST_PUBLISHED_FLOWS, {
      variables: { emailId, flowIds },
    });

  const { slug: teamSlug } = useStore((state) => state.getTeam());

  const usedFlows =
    latestFlowsData?.publishedFlows.map((publishedFlow) => ({
      slug: publishedFlow.flow?.slug,
      name: publishedFlow.flow?.name,
      flowId: publishedFlow.flowId,
    })) || [];

  // Query will return duplicates of flows that have been published multiple times, hence filtering by first entry (query includes `order by created_at desc`)
  // TODO: Decide if it's ok to filter client-side or if another Hasura view would be more appropriate? (using `limit` in the Hasura query would limit the query to one flow returned, as opposed to one flow per ID)
  const uniqueFlows = Array.from(
    usedFlows
      .reduce((map, flow) => {
        if (!map.has(flow.flowId)) {
          map.set(flow.flowId, flow);
        }
        return map;
      }, new Map())
      .values(),
  );

  const deletable = uniqueFlows.length === 0;

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
                This email address cannot be removed as it is currently used in
                the following flows:
              </Typography>
              {uniqueFlows.map((flow) => (
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
                Please <strong>update and republish</strong> the flow settings
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
