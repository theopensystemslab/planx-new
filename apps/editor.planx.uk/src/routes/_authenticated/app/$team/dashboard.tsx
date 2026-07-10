import { createFileRoute, redirect } from "@tanstack/react-router";
import { isSystemTeam } from "lib/systemTeams";
import Dashboard from "pages/Dashboard";

export const Route = createFileRoute("/_authenticated/app/$team/dashboard")({
  beforeLoad: ({ params, context }) => {
    if (isSystemTeam(context.team.slug)) {
      throw redirect({ to: "/app/$team/flows", params: { team: params.team } });
    }
  },
  component: Dashboard,
});
