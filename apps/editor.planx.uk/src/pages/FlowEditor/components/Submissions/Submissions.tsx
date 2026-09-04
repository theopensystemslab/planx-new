import Typography from "@mui/material/Typography";
import { BREADCRUMBS_HEIGHT } from "components/Breadcrumbs";
import React, { useMemo } from "react";
import FixedHeightDashboardContainer from "ui/editor/FixedHeightDashboardContainer";
import SettingsSection from "ui/editor/SettingsSection";
import { slugify } from "utils";

import { useStore } from "../../lib/store";
import EventsLog from "./components/EventsLog";
import { useGetSubmissions } from "./hooks";
import type { SubmissionsProps } from "./types";

const Submissions: React.FC<SubmissionsProps> = ({ flowSlug }) => {
  const [teamId] = useStore((state) => [state.teamId]);
  const { data, loading, error } = useGetSubmissions(teamId);

  const submissions = useMemo(() => data?.submissions || [], [data]);

  // filter by flow if flowId prop is passed from route params
  const filteredSubmissions = submissions.filter(
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
