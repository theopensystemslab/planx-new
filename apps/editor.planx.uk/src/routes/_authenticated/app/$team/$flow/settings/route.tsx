import { createFileRoute, Outlet } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import FlowSettingsLayout from "pages/FlowEditor/components/Settings/Flow/Layout";
import { editorPageTitle } from "utils/pageTitle";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/settings",
)({
  pendingComponent: DelayedLoadingIndicator,
  component: RouteComponent,
  head: ({ match }) =>
    editorPageTitle(
      "Flow settings",
      match.context.flowName,
      match.context.team.name,
    ),
});

function RouteComponent() {
  return (
    <FlowSettingsLayout>
      <Outlet />
    </FlowSettingsLayout>
  );
}
