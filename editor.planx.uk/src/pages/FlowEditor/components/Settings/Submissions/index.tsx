import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";
import { FeaturePlaceholder } from "ui/editor/FeaturePlaceholder";

import { useStore } from "../../../lib/store";
import {
  fetchSubmittedApplications,
  SubmissionData,
} from "./submissionDataTypesAndQueries";

const Submissions: React.FC = () => {
  const flowSlug = useStore.getState().flowSlug;
  const teamSlug = useStore.getState().teamSlug;
  const [applications, setApplications] = useState<SubmissionData[]>();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (flowSlug && teamSlug) {
      fetchSubmittedApplications(flowSlug, teamSlug)
        .then((result) => setApplications(result.submission_services_summary))
        .catch((error) => {
          setError(error);
        });
    }
  }, [flowSlug, teamSlug]);

  useEffect(() => {
    console.log(applications);
    console.log(error);
  }, [applications, error]);

  return (
    <Box>
      <Typography variant="h2" component="h3" gutterBottom>
        Submissions
      </Typography>
      <Typography variant="body1">
        View data on the user submitted applications for this service.
      </Typography>
      <Box py={5}>
        <FeaturePlaceholder title="Feature in development" />
      </Box>
    </Box>
  );
};

export default Submissions;
