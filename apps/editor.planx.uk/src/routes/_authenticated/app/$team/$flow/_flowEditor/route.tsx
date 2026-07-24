import { createFileRoute, Outlet } from "@tanstack/react-router";
import ErrorFallback from "components/Error/ErrorFallback";
import FlowEditor from "pages/FlowEditor";
import { NoteEditorDialog } from "pages/FlowEditor/components/Flow/notes/NoteEditorDialog";
import AddComponentModal from "pages/FlowEditor/components/forms/AddComponentModal";
import { RecentFlowsProvider } from "pages/FlowEditor/components/RecentFlows/RecentFlowsContext";
import { useStore } from "pages/FlowEditor/lib/store";
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
  const [open, parent, before, noteEditorOpen] = useStore((s) => [
    s.componentSelectorOpen,
    s.componentSelectorParent,
    s.componentSelectorBefore,
    s.noteEditorOpen,
  ]);

  return (
    <RecentFlowsProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <FlowEditor />
        {open && <AddComponentModal parent={parent} before={before} />}
        {noteEditorOpen && <NoteEditorDialog />}
        <Outlet />
      </ErrorBoundary>
    </RecentFlowsProvider>
  );
}
