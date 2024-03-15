import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import ErrorFallback from "components/ErrorFallback";
import React from "react";

import { SubmissionData } from "./submissionData";

interface SubmissionsViewProps {
  applications: SubmissionData[];
  loading: boolean;
  error: Error | undefined;
}

const SubmissionsView: React.FC<SubmissionsViewProps> = ({
  applications,
  loading,
  error,
}) => {
  if (loading) return <DelayedLoadingIndicator msDelayBeforeVisible={500} />;
  if (error) return <ErrorFallback error={error} />;
  if (applications.length === 0)
    return (
      <Typography variant="body1">
        No submitted applications found for this service.
      </Typography>
    );
  return (
    <List>
      {applications.map((application, index) => (
        <ListItem key={index}>{application.sessionId}</ListItem>
      ))}
    </List>
  );
};

export default SubmissionsView;
