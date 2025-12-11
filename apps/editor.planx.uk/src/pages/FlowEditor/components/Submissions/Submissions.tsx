import { gql, useQuery } from "@apollo/client";
import Typography from "@mui/material/Typography";
import React, { useMemo } from "react";
import FixedHeightDashboardContainer from "ui/editor/FixedHeightDashboardContainer";
import SettingsSection from "ui/editor/SettingsSection";
import { slugify } from "utils";

import { useStore } from "../../lib/store";
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
          order_by: { created_at: desc }
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
      pollInterval: 10_000,
    },
  );

  const submissions = useMemo(() => data?.submissions || [], [data]);

  // filter by flow if flowId prop is passed from route params
  const filteredSubmissions = submissions.filter(
    (submission) => !flowSlug || slugify(submission.flowName) === flowSlug,
  );

  return (
    <FixedHeightDashboardContainer bgColor="background.paper">
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Submissions
        </Typography>
        <Typography variant="body1" maxWidth="contentWrap">
          Payment and send events for{" "}
          {flowSlug ? "this service" : "all services in this team"}. Successful
          submissions received within the last 28 days are available to
          download. This table includes events since 1st January 2024.
        </Typography>
      </SettingsSection>
      <EventsLog
        submissions={filteredSubmissions}
        loading={loading}
        error={error}
        filterByFlow={Boolean(flowSlug)}
      />
    </FixedHeightDashboardContainer>
  );
};

export default Submissions;
