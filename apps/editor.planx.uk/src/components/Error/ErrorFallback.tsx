import Typography from "@mui/material/Typography";
import Card from "@planx/components/shared/Preview/Card";
import { ErrorSummaryContainer } from "@planx/components/shared/Preview/ErrorSummaryContainer";
import { logger } from "airbrake";
import React from "react";
import type { FallbackProps } from "react-error-boundary";

import { GraphErrorComponent, isGraphError } from "./GraphError";

const normalizeError = (error: unknown): Error => {
  if (error instanceof Error) return error;
  if (typeof error === "string") return new Error(error);
  try {
    return new Error(JSON.stringify(error));
  } catch {
    return new Error(String(error));
  }
};

const ErrorFallback: React.FC<FallbackProps> = ({ error }) => {
  if (isGraphError(error)) return <GraphErrorComponent error={error} />;

  const normalizedError = normalizeError(error);
  logger.notify(normalizedError);

  return (
    <Card>
      <ErrorSummaryContainer role="alert">
        <Typography variant="h4" component="h1" gutterBottom>
          Something went wrong
        </Typography>
        <Typography>
          {normalizedError.message && (
            <pre style={{ color: "#E91B0C", whiteSpace: "pre-line" }}>
              {normalizedError.message}
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
