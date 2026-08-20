import { gql, useQuery } from "@apollo/client";
import Close from "@mui/icons-material/CloseOutlined";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import { useNavigate } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { useStore } from "pages/FlowEditor/lib/store";
import { CloseButton } from "ui/icons/CloseButton";

import type { Submission } from "../types";
import { SubmissionDetails } from "./SubmissionDetails";
import { SubmissionEventsHistory } from "./SubmissionEventsHistory";

// TODO: refactor into hooks / queries pattern
const GET_SUBMISSION_EVENTS = gql`
  query GetSubmissionEvents($sessionId: uuid!) {
    submissions: submission_services_log(
      where: { session_id: { _eq: $sessionId } }
      order_by: { created_at: desc }
    ) {
      flowId: flow_id
      sessionId: session_id
      eventId: event_id
      eventType: event_type
      status: status
      retry: retry
      response: response
      address: address
      createdAt: created_at
      flowName: flow_name
    }
  }
`;

interface SubmissionDetailModalProps {
  sessionId: string;
}

const getSubmittedAt = (events: Submission[]): string | undefined => {
  const sendEventTypes: Submission["eventType"][] = [
    "Submit to BOPS",
    "Submit to Uniform",
    "Send to email",
    "Upload to AWS S3",
    "Upload to AWS S3 (no notification)",
    "Submit to Idox Nexus",
  ];

  const successfulSend = events.find(
    (event) =>
      sendEventTypes.includes(event.eventType) && event.status === "Success",
  );

  return successfulSend?.createdAt ?? undefined;
};

const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  sessionId,
}) => {
  const navigate = useNavigate();
  const [teamSlug] = useStore((state) => [state.teamSlug]);

  const { data, loading, error } = useQuery<{ submissions: Submission[] }>(
    GET_SUBMISSION_EVENTS,
    {
      variables: { sessionId },
      skip: !sessionId,
    },
  );

  const events = data?.submissions || [];
  const latestEvent = events[0];
  const submittedAt = getSubmittedAt(events);

  if (loading) return <DelayedLoadingIndicator />;
  if (error) throw error;
  return (
    <Dialog
      open
      slotProps={{
        paper: {
          sx: {
            width: "66.67%",
            maxWidth: "66.67%",
            margin: "auto",
          },
        },
      }}
    >
      <CloseButton
        aria-label="close"
        onClick={() => {
          navigate({
            to: "/app/$team/submissions",
            params: {
              team: teamSlug,
            },
          });
        }}
        size="large"
      >
        <Close />
      </CloseButton>
      <DialogTitle variant="h2">Submission details</DialogTitle>
      <DialogContent>
        <Grid container>
          <Grid size={6}>
            <SubmissionDetails
              sessionId={sessionId}
              latestEvent={latestEvent}
              teamSlug={teamSlug}
              submittedAt={submittedAt}
            />
          </Grid>

          <Grid size={6}>
            <SubmissionEventsHistory events={events} />
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionDetailModal;
