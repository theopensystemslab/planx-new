import { gql, useQuery } from "@apollo/client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import { useNavigate } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { useStore } from "pages/FlowEditor/lib/store";

import type { Submission } from "../types";

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

  if (loading) return <DelayedLoadingIndicator />;
  if (error) throw error;
  return (
    <Dialog open>
      <Typography variant="h2" component="h1" gutterBottom>
        Submission Details
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 3 }}>
        <Box>
          <Typography variant="h4">Details</Typography>
          <Typography>Address: {latestEvent?.address}</Typography>
          <Typography>Service: {latestEvent?.flowName}</Typography>
          <Typography>Session ID: {sessionId}</Typography>
        </Box>

        <Box>
          <Typography variant="h4">Event History</Typography>
          {events.map((event, index) => (
            <ListItem key={`${event.eventId}-${index}`}>
              <Box>
                <Typography>
                  {event.eventType} {event.retry && "[Retry]"}
                </Typography>
                <Typography>
                  Status: {event.status},{" "}
                  {new Date(event.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </ListItem>
          ))}
        </Box>
      </Box>
      <DialogActions>
        <Button
          onClick={() =>
            navigate({
              to: "/app/$team/submissions",
              params: {
                team: teamSlug,
              },
            })
          }
        >
          Back
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubmissionDetailModal;
