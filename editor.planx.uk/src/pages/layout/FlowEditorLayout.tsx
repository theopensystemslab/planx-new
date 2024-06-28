import EditorNavMenu, { flowLayoutRoutes } from "components/EditorNavMenu";
import ErrorFallback from "components/ErrorFallback";
import React, { PropsWithChildren } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Dashboard from "ui/editor/Dashboard";

const FlowEditorLayout: React.FC<PropsWithChildren> = ({ children }) => (
  <Dashboard>
    <EditorNavMenu compact routes={flowLayoutRoutes} />
    <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
  </Dashboard>
);

export default FlowEditorLayout;
