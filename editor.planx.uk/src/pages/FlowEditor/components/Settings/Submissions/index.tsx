import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";

import { useStore } from "../../../lib/store";
import { useSubmittedApplications } from "./submissionData";
import SubmissionsView from "./SubmissionsView";

const Submissions: React.FC = () => {
  const [flowSlug, teamSlug] = useStore((state) => [
    state.flowSlug,
    state.teamSlug,
  ]);
  const { applications, loading, error } = useSubmittedApplications({
    flowSlug,
    teamSlug,
  });

  return (
    <Box>
      <Typography variant="h2" component="h3" gutterBottom>
        Submissions
      </Typography>
      <Typography variant="body1">
        View data on the user submitted applications for this service.
      </Typography>
      <Box py={5}>
        <SubmissionsView
          applications={applications}
          loading={loading}
          error={error}
        />
      </Box>
    </Box>
  );
};

export default Submissions;
