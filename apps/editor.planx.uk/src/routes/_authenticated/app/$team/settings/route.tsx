import { createFileRoute, Outlet } from "@tanstack/react-router";
import TeamSettingsLayout from "pages/FlowEditor/components/Settings/Team/Layout";
import { editorPageTitle } from "utils/pageTitle";

export const Route = createFileRoute("/_authenticated/app/$team/settings")({
  component: RouteComponent,
  head: ({ match }) =>
    editorPageTitle("Team settings", match.context.team.name),
});

function RouteComponent() {
  return (
    <TeamSettingsLayout>
      <Outlet />
    </TeamSettingsLayout>
  );
}
