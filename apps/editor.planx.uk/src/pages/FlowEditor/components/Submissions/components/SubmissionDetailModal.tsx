import { gql, useQuery } from "@apollo/client";
import Close from "@mui/icons-material/CloseOutlined";
import Box from "@mui/material/Box";
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

const SubmissionModalWrapper = ({
  handleClose,
  children,
}: {
  handleClose: () => void;
  children: React.ReactNode;
}) => {
  return (
    <Dialog
      open
      slotProps={{
        paper: {
          sx: {
            width: { xs: "90%", md: "66.67%" },
            maxWidth: { xs: "90%", md: "66.67%" },
            margin: "auto",
          },
        },
      }}
      onClose={handleClose}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          marginX: 1,
        }}
      >
        <DialogTitle variant="h2">Submission details</DialogTitle>
        <CloseButton
          aria-label="close"
          onClick={handleClose}
          size="large"
          sx={{ paddingTop: 2.5 }}
        >
          <Close />
        </CloseButton>
      </Box>

      <DialogContent children={children} />
    </Dialog>
  );
};

const getSubmittedAt = (events: Submission[]): string | undefined => {
  const successfulSend = events.find(
    (event) =>
      event.eventType !== "Pay" &&
      event.eventType !== "Started session" &&
      event.status === "Success",
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

  const handleClose = () => {
    navigate({
      search: undefined,
    });
  };

  const events = data?.submissions || [];
  const latestEvent = events[0];
  const submittedAt = getSubmittedAt(events);

  if (loading) {
    return (
      <SubmissionModalWrapper handleClose={handleClose}>
        <DelayedLoadingIndicator />
      </SubmissionModalWrapper>
    );
  }

  if (error) throw error;
  return (
    <SubmissionModalWrapper handleClose={handleClose}>
      <Grid container>
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{
            position: { md: "sticky" },
            top: 0,
            alignSelf: "flex-start",
          }}
        >
          <SubmissionDetails
            sessionId={sessionId}
            latestEvent={latestEvent}
            teamSlug={teamSlug}
            submittedAt={submittedAt}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SubmissionEventsHistory events={events} />
        </Grid>
      </Grid>
    </SubmissionModalWrapper>
  );
};

export default SubmissionDetailModal;
