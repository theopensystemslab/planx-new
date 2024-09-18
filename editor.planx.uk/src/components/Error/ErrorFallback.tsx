import Typography from "@mui/material/Typography";
import Card from "@planx/components/shared/Preview/Card";
import { ErrorSummaryContainer } from "@planx/components/shared/Preview/ErrorSummaryContainer";
import { logger } from "airbrake";
import React from "react";

import { GraphErrorComponent, isGraphError } from "./GraphError";

const ErrorFallback: React.FC<{ error: Error }> = ({ error }) => {
  if (isGraphError(error)) return <GraphErrorComponent error={error} />;

  logger.notify(error);

  return (
    <Card>
      <ErrorSummaryContainer role="alert">
        <Typography variant="h4" component="h1" gutterBottom>
          Something went wrong
        </Typography>
        <Typography>
          {error.message && (
            <pre style={{ color: "#E91B0C", whiteSpace: "pre-line" }}>
              {error.message}
            </pre>
          )}
        </Typography>
        <Typography variant="body2">
          This bug has been automatically logged and our team will see it soon.
        </Typography>
      </ErrorSummaryContainer>
    </Card>
  );
};

export default ErrorFallback;
