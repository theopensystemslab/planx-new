import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppErrorBoundary } from "components/Error/AppErrorBoundary";
import FlowEditor from "pages/FlowEditor";
import { RecentFlowsProvider } from "pages/FlowEditor/components/RecentFlows/RecentFlowsContext";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/_flowEditor",
)({
  component: FlowEditorLayout,
});

/**
 * Ensure a single, persistent, instance of FlowEditor is mounted
 */
function FlowEditorLayout() {
  return (
    <RecentFlowsProvider>
      <AppErrorBoundary>
        <React.Fragment>
          <FlowEditor />
          <Outlet />
        </React.Fragment>
      </AppErrorBoundary>
    </RecentFlowsProvider>
  );
}
