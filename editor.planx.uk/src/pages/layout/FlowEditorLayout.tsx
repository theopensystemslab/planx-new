import ErrorFallback from "components/ErrorFallback";
import React, { PropsWithChildren } from "react";
import { ErrorBoundary } from "react-error-boundary";

const FlowEditorLayout: React.FC<PropsWithChildren> = ({ children }) => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
);

export default FlowEditorLayout;
