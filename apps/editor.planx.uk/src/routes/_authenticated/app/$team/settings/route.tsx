import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import TeamSettingsLayout from "pages/FlowEditor/components/Settings/Team/Layout";

import { EDITOR_ROLES } from "../../../../../ui/editor/Permission";

export const Route = createFileRoute("/_authenticated/app/$team/settings")({
  staticData: { pageTitle: "Team settings" },
  beforeLoad: ({ context }) => {
    const isAuthorised = Boolean(
      context.role && EDITOR_ROLES.includes(context.role),
    );

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
