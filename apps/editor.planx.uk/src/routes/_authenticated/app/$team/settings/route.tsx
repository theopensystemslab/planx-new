import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import TeamSettingsLayout from "pages/FlowEditor/components/Settings/Team/Layout";
import { useStore } from "pages/FlowEditor/lib/store";

import { EDITOR_ROLES } from "../../../../../ui/editor/Permission";

export const Route = createFileRoute("/_authenticated/app/$team/settings")({
  staticData: { pageTitle: "Team settings" },
  beforeLoad: () => {
    const role = useStore.getState().getUserRoleForCurrentTeam();

    const isAuthorised = !role || EDITOR_ROLES.includes(role);

    if (!isAuthorised) {
      throw notFound();
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <TeamSettingsLayout>
      <Outlet />
    </TeamSettingsLayout>
  );
}
