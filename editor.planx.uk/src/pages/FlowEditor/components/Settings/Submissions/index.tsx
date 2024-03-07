import Typography from "@mui/material/Typography";
import ErrorFallback from "components/ErrorFallback";
import { ApplicationData, fetchSubmittedApplications } from "lib/applications";
import React, { useEffect, useState } from "react";
import EditorRow from "ui/editor/EditorRow";

import { useStore } from "../../../lib/store";
import ApplicationsTable from "./ApplicationsTable";
import NoApplications from "./NoApplications";

const Submissions = () => {
  const flowSlug = useStore.getState().flowSlug;
  const teamSlug = useStore.getState().teamSlug;
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (flowSlug && teamSlug) {
      fetchSubmittedApplications(flowSlug, teamSlug)
        .then((result) => setApplications(result.applications_summary))
        .catch((error) => {
          setError(error);
        });
    }
  }, [flowSlug, teamSlug]);

  const ApplicationSubmissions = () => {
    if (error) {
      return <ErrorFallback error={error} />;
    }
    return applications.length > 0 ? (
      <ApplicationsTable applications={applications} />
    ) : (
      <NoApplications />
    );
  };

  return (
    <EditorRow>
      <Typography variant="h2" component="h3" gutterBottom>
        Submissions
      </Typography>
      <ApplicationSubmissions />
    </EditorRow>
  );
};

export default Submissions;
