import { createFileRoute, Outlet } from "@tanstack/react-router";
import ErrorFallback from "components/Error/ErrorFallback";
import FlowEditor from "pages/FlowEditor";
import AddComponentModal from "pages/FlowEditor/components/forms/AddComponentModal";
import { RecentFlowsProvider } from "pages/FlowEditor/components/RecentFlows/RecentFlowsContext";
import { componentSelectorState } from "pages/FlowEditor/lib/componentSelectorState";
import React, { useSyncExternalStore } from "react";
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
  const selectorState = useSyncExternalStore(
    componentSelectorState.subscribe,
    componentSelectorState.getSnapshot,
  );

  return (
    <RecentFlowsProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <FlowEditor />
        {selectorState.open && (
          <AddComponentModal
            parent={selectorState.parent}
            before={selectorState.before}
          />
        )}
        <Outlet />
      </ErrorBoundary>
    </RecentFlowsProvider>
  );
}
