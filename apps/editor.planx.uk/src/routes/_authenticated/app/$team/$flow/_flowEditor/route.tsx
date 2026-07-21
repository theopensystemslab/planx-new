import { createFileRoute, Outlet } from "@tanstack/react-router";
import ErrorFallback from "components/Error/ErrorFallback";
import FlowEditor from "pages/FlowEditor";
import { NoteEditorDialog } from "pages/FlowEditor/components/Flow/notes/NoteEditorDialog";
import { RecentFlowsProvider } from "pages/FlowEditor/components/RecentFlows/RecentFlowsContext";
import { useStore } from "pages/FlowEditor/lib/store";
import { ErrorBoundary } from "react-error-boundary";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/_flowEditor",
)({
  component: FlowEditorLayout,
});

/**
 * Ensure a single, persistent, instance of FlowEditor is mounted
 */
function FlowEditorLayout() {
  const noteEditorOpen = useStore((s) => s.noteEditorOpen);

  return (
    <RecentFlowsProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <FlowEditor />
        {noteEditorOpen && <NoteEditorDialog />}
        <Outlet />
      </ErrorBoundary>
    </RecentFlowsProvider>
  );
}
