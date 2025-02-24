import { gql, useQuery } from "@apollo/client";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import React, { useMemo } from "react";
import SettingsSection from "ui/editor/SettingsSection";

import { useStore } from "../../../lib/store";
import EventsLog from "./components/EventsLog";
import { Submission, SubmissionsProps } from "./types";

const Submissions: React.FC<SubmissionsProps> = ({ flowSlug }) => {
  const [teamId] = useStore((state) => [state.teamId]);

  // submission_services_log view is already filtered for events >= Jan 1 2024
  const { data, loading, error } = useQuery<{ submissions: Submission[] }>(
    gql`
      query GetSubmissions($team_id: Int!) {
        submissions: submission_services_log(
          where: { team_id: { _eq: $team_id } }
          order_by: { created_at: asc }
        ) {
          sessionId: session_id
          eventId: event_id
          eventType: event_type
          status: status
          retry: retry
          response: response
          createdAt: created_at
          flowName: flow_name
        }
      }
    `,
    {
      variables: { team_id: teamId },
      skip: !teamId,
    },
  );

  const submissions = useMemo(() => data?.submissions || [], [data]);

  const getFlowNameFromSlug = (slug: string) => {
    return slug.replace(/-/g, " ");
  };

  const flowName = flowSlug && getFlowNameFromSlug(flowSlug);

  // filter by flow if flowSlug prop is passed from route params
  const filteredSubmissions = submissions.filter(
    (submission) =>
      !flowSlug ||
      submission.flowName.toLowerCase() === flowName?.toLowerCase(),
  );

  return (
    <Container>
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Submissions
        </Typography>
        <Typography variant="body1">
          {`Feed of payment and submission events for ${
            flowSlug ? "this service" : "services in this team"
          }.
          Successful submission events from within the last 28 days are
          available to be downloaded by team editors.`}
        </Typography>
      </SettingsSection>
      <SettingsSection>
        <EventsLog
          submissions={filteredSubmissions}
          loading={loading}
          error={error}
          filterByFlow={Boolean(flowSlug)}
        />
      </SettingsSection>
    </Container>
  );
};

export default Submissions;
