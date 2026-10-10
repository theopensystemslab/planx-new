import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { isSystemTeam } from "lib/systemTeams";
import Dashboard from "pages/Dashboard";
import { useStore } from "pages/FlowEditor/lib/store";

import { EDITOR_ROLES } from "../../../../ui/editor/Permission";

export const Route = createFileRoute("/_authenticated/app/$team/dashboard")({
  staticData: { pageTitle: "Dashboard" },
  beforeLoad: ({ params, context }) => {
    if (isSystemTeam(context.team.slug)) {
      throw redirect({ to: "/app/$team/flows", params: { team: params.team } });
    }

    const role = useStore.getState().getUserRoleForCurrentTeam();

    const isAuthorised = !role || EDITOR_ROLES.includes(role);

    if (!isAuthorised) {
      throw notFound();
    }
  },
  component: Dashboard,
});
