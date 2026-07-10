import { createFileRoute, redirect } from "@tanstack/react-router";
import { isSystemTeam } from "lib/systemTeams";

export const Route = createFileRoute("/_authenticated/app/$team/")({
  beforeLoad: ({ params, context }) => {
    throw redirect({
      to: isSystemTeam(context.team.name)
        ? "/app/$team/flows"
        : "/app/$team/dashboard",
      params: { team: params.team },
    });
  },
});
