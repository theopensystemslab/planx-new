import Typography from "@mui/material/Typography";
import Card from "@planx/components/shared/Preview/Card";
import { ErrorSummaryContainer } from "@planx/components/shared/Preview/ErrorSummaryContainer";
import React from "react";

import { logger } from "../airbrake";

function ErrorFallback(props: { error: Error }) {
  logger.notify(props.error);

  return (
    <Card>
      <ErrorSummaryContainer role="alert">
        <Typography variant="h5" component="h1" gutterBottom>
          Something went wrong
        </Typography>
        <Typography>
          {props.error?.message && (
            <pre style={{ color: "#E91B0C" }}>{props.error.message}</pre>
          )}
        </Typography>
        <Typography variant="body2">
          This bug has been automatically logged and our team will see it soon.
        </Typography>
      </ErrorSummaryContainer>
    </Card>
  );
}

export default ErrorFallback;
