import { gql, useQuery } from "@apollo/client";
import Typography from "@mui/material/Typography";
import React, { useMemo } from "react";
import FixedHeightDashboardContainer from "ui/editor/FixedHeightDashboardContainer";
import SettingsSection from "ui/editor/SettingsSection";

import { useStore } from "../../lib/store";
import EventsLog from "./components/EventsLog";
import { Submission, SubmissionsProps } from "./types";

const Submissions: React.FC<SubmissionsProps> = ({ flowId }) => {
  const [teamId] = useStore((state) => [state.teamId]);

  // submission_services_log view is already filtered for events >= Jan 1 2024
  const { data, loading, error } = useQuery<{ submissions: Submission[] }>(
    gql`
      query GetSubmissions($team_id: Int!) {
        submissions: submission_services_log(
          where: { team_id: { _eq: $team_id } }
          order_by: { created_at: asc }
        ) {
          flowId: flow_id
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

  // filter by flow if flowId prop is passed from route params
  const filteredSubmissions = submissions.filter(
    (submission) => !flowId || submission.flowId === flowId,
  );

  return (
    <FixedHeightDashboardContainer bgColor="background.paper">
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Submissions
        </Typography>
        <Typography variant="body1" maxWidth="contentWrap">
          {`Feed of payment and submission events for ${
            flowId ? "this service" : "services in this team"
          }.`}
        </Typography>
        <Typography variant="body1" maxWidth="contentWrap">
          Successful submission events from within the last 28 days are
          available to be downloaded by team editors.
        </Typography>
      </SettingsSection>
      <EventsLog
        submissions={filteredSubmissions}
        loading={loading}
        error={error}
        filterByFlow={Boolean(flowId)}
      />
    </FixedHeightDashboardContainer>
  );
};

export default Submissions;
