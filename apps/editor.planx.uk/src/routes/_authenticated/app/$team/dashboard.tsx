import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { isSystemTeam } from "lib/systemTeams";
import Dashboard from "pages/Dashboard";

export const Route = createFileRoute("/_authenticated/app/$team/dashboard")({
  staticData: { pageTitle: "Dashboard" },
  beforeLoad: ({ params, context }) => {
    if (!context.role) {
      throw notFound();
    }

    if (
      // Dashboards are not meaningful for "system" teams, always skip
      isSystemTeam(context.team.slug) ||
      // Analysts can view flows, but not dashboards
      context.role === "analyst"
    ) {
      throw redirect({ to: "/app/$team/flows", params: { team: params.team } });
    }
  },
  component: Dashboard,
});
