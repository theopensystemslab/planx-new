import ErrorFallback from "components/Error/ErrorFallback";
import FlowEditor from "pages/FlowEditor";
import React, { PropsWithChildren } from "react";
import { ErrorBoundary } from "react-error-boundary";

const FlowEditorLayout: React.FC<PropsWithChildren> = ({ children }) => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <FlowEditor />
    {children}
  </ErrorBoundary>
);

export default FlowEditorLayout;
