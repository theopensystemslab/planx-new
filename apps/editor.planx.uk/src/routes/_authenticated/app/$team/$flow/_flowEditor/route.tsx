import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppErrorBoundary } from "components/Error/AppErrorBoundary";
import { hasFeatureFlag } from "lib/featureFlags";
import FlowEditor from "pages/FlowEditor";
import { FlowNotesProvider } from "pages/FlowEditor/components/Flow/notes/FlowNotesContext";
import { RecentFlowsProvider } from "pages/FlowEditor/components/RecentFlows/RecentFlowsContext";
import React from "react";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/_flowEditor",
)({
  component: FlowEditorLayout,
});

/**
 * Ensure a single, persistent, instance of FlowEditor is mounted
 *
 * FlowNotesProvider wraps FlowEditor and the Outlet so that note routes can also read live note data via useFlowNotesContext()
 */
function FlowEditorLayout() {
  const NotesWrapper = hasFeatureFlag("NOTES")
    ? FlowNotesProvider
    : React.Fragment;

  return (
    <RecentFlowsProvider>
      <AppErrorBoundary>
        <NotesWrapper>
          <FlowEditor />
          <Outlet />
        </NotesWrapper>
      </AppErrorBoundary>
    </RecentFlowsProvider>
  );
}
