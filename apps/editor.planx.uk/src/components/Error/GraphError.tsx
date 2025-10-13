import Typography from "@mui/material/Typography";
import Card from "@planx/components/shared/Preview/Card";
import { ErrorSummaryContainer } from "@planx/components/shared/Preview/ErrorSummaryContainer";
import React from "react";

type GraphErrorType =
  | "nodeMustFollowFindProperty"
  | "mapInputFieldMustFollowFindProperty";

const GRAPH_ERROR_MESSAGES: Record<GraphErrorType, string> = {
  nodeMustFollowFindProperty:
    'Edit this flow so that this node is positioned after "Find property"; an address or site boundary drawing is required to fetch data',
  mapInputFieldMustFollowFindProperty:
    'Edit this flow so that this component is positioned after "FindProperty"; an address is required for schemas that include a "map" field.',
};

export class GraphError extends Error {
  constructor(public type: GraphErrorType) {
    super();
    this.type = type;
  }
}

export const isGraphError = (error: unknown): error is GraphError =>
  error instanceof GraphError;

export const GraphErrorComponent: React.FC<{ error: GraphError }> = ({
  error,
}) => (
  <Card>
    <ErrorSummaryContainer
      role="status"
      data-testid="error-summary-invalid-graph"
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Invalid graph
      </Typography>
      <Typography variant="body2">
        {GRAPH_ERROR_MESSAGES[error.type]}
      </Typography>
    </ErrorSummaryContainer>
  </Card>
);
