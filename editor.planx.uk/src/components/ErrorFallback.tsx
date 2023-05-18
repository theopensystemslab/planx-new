import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Card from "@planx/components/shared/Preview/Card";
import React from "react";

import { logger } from "../airbrake";

const ErrorSummary = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  padding: theme.spacing(3),
  border: `5px solid #E91B0C`,
}));

function ErrorFallback(props: { error: Error }) {
  logger.notify(props.error);

  return (
    <Card>
      <ErrorSummary role="alert">
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
      </ErrorSummary>
    </Card>
  );
}

export default ErrorFallback;
