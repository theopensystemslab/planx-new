import { gql, useQuery } from "@apollo/client";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import React, { useMemo } from "react";
import SettingsRow from "ui/editor/SettingsRow";

import { useStore } from "../../../lib/store";
import EventsLog from "./EventsLog";

export interface Submission {
  sessionId: string;
  eventId: string;
  eventType:
    | "Pay"
    | "Submit to BOPS"
    | "Submit to Uniform"
    | "Send to email"
    | "Upload to AWS S3";
  status?:
    | "Success"
    | "Failed (500)" // Hasura scheduled event status codes
    | "Failed (502)"
    | "Failed (503)"
    | "Failed (504)"
    | "Failed (400)"
    | "Failed (401)"
    | "Started" // Payment status enum codes (excluding "Created")
    | "Submitted"
    | "Capturable"
    | "Failed"
    | "Cancelled"
    | "Error"
    | "Unknown";
  retry: boolean;
  response: Record<string, any>;
  createdAt: string;
}

export interface GetSubmissionsResponse {
  submissions: Submission[];
  loading: boolean;
  error: Error | undefined;
}

const Submissions: React.FC = () => {
  const flowId = useStore((state) => state.id);

  // submission_services_log view is already filtered for events >= Jan 1 2024
  const { data, loading, error } = useQuery<{ submissions: Submission[] }>(
    gql`
      query GetSubmissions($flow_id: uuid!) {
        submissions: submission_services_log(
          where: { flow_id: { _eq: $flow_id } }
          order_by: { created_at: asc }
        ) {
          sessionId: session_id
          eventId: event_id
          eventType: event_type
          status: status
          retry: retry
          response: response
          createdAt: created_at
        }
      }
    `,
    {
      variables: { flow_id: flowId },
      skip: !flowId,
    },
  );

  const submissions = useMemo(() => data?.submissions || [], [data]);

  return (
    <Container maxWidth="contentWrap">
      <Box>
        <SettingsRow>
          <Typography variant="h2" component="h3" gutterBottom>
            Submissions
          </Typography>
          <Typography variant="body1">
            Feed of payment and submission events for this service
          </Typography>
        </SettingsRow>
        <SettingsRow>
          <EventsLog
            submissions={submissions}
            loading={loading}
            error={error}
          />
        </SettingsRow>
      </Box>
    </Container>
  );
};

export default Submissions;
