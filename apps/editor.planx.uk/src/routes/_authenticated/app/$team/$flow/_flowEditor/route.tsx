import { createFileRoute, Outlet } from "@tanstack/react-router";
import ErrorFallback from "components/Error/ErrorFallback";
import FlowEditor from "pages/FlowEditor";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/_flowEditor",
)({
  component: FlowEditorLayout,
});

/**
 * Ensure a single, persistant, instance of FlowEditor is mounted
 */
function FlowEditorLayout() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <FlowEditor />
      <Outlet />
    </ErrorBoundary>
  );
}
