import { gql, useQuery } from "@apollo/client";
import Typography from "@mui/material/Typography";
import { BREADCRUMBS_HEIGHT } from "components/Breadcrumbs";
import React, { useMemo } from "react";
import FixedHeightDashboardContainer from "ui/editor/FixedHeightDashboardContainer";
import SettingsSection from "ui/editor/SettingsSection";
import { slugify } from "utils";

import { useStore } from "../../lib/store";
import EventsLogGrouped from "./components/EventsLogGrouped";
import type { Submission, SubmissionsProps, SubmissionSummary } from "./types";

const Submissions: React.FC<SubmissionsProps> = ({ flowSlug }) => {
  const [teamId] = useStore((state) => [state.teamId]);

  // submission_services_log view is already filtered for events >= Jan 1 2024
  const { data, loading, error } = useQuery<{ submissions: Submission[] }>(
    gql`
      query GetSubmissions($team_id: Int!) {
        submissions: submission_services_log(
          where: { team_id: { _eq: $team_id } }
          order_by: [
            { session_id: asc }
            { event_type: asc }
            { created_at: desc }
          ]
          distinct_on: [session_id, event_type]
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
    `,
    {
      variables: { team_id: teamId },
      skip: !teamId,
      pollInterval: 10_000,
    },
  );

  const submissions = useMemo(() => data?.submissions || [], [data]);

  const sessionSummaries = useMemo(() => {
    const grouped = submissions.reduce(
      (acc, submission) => {
        if (!acc[submission.sessionId]) {
          acc[submission.sessionId] = {
            id: submission.sessionId,
            flowId: submission.flowId,
            flowName: submission.flowName,
            address: submission.address,
            events: [],
            mostRecentDate: submission.createdAt,
          };
        }

        acc[submission.sessionId].events.push(submission);

        // most recent date (eg for events after created date)
        if (submission.createdAt > acc[submission.sessionId].mostRecentDate) {
          acc[submission.sessionId].mostRecentDate = submission.createdAt;
        }

        return acc;
      },
      {} as Record<string, SubmissionSummary>,
    );

    return Object.values(grouped).map((session) => ({
      ...session,
      eventCount: session.events.length,
      // if ANY most recent event failed, session fails
      sessionStatus: session.events.some((e) => e.status !== "Success")
        ? "Failed"
        : "Success",
    }));
  }, [submissions]);

  // filter by flow if flowId prop is passed from route params
  const filteredSubmissions = sessionSummaries.filter(
    (submission) => !flowSlug || slugify(submission.flowName) === flowSlug,
  );

  return (
    <FixedHeightDashboardContainer
      bgColor="background.paper"
      topOffset={flowSlug ? BREADCRUMBS_HEIGHT : 0}
    >
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Submissions
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: "contentWrap" }}>
          Payment and send events for{" "}
          {flowSlug ? "this service" : "all services in this team"}. Successful
          submissions received within the last 28 days are available to
          download. This table includes events since 1st January 2024.
        </Typography>
      </SettingsSection>
      <EventsLogGrouped
        submissions={filteredSubmissions}
        loading={loading}
        error={error}
        filterByFlow={Boolean(flowSlug)}
      />
    </FixedHeightDashboardContainer>
  );
};

export default Submissions;
