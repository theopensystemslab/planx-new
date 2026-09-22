import { createFileRoute, redirect } from "@tanstack/react-router";
import { isSystemTeam } from "lib/systemTeams";

const IS_PROD = import.meta.env.VITE_APP_ENV === "production";

export const Route = createFileRoute("/_authenticated/app/$team/")({
  beforeLoad: ({ params, context }) => {
    throw redirect({
      to:
        isSystemTeam(context.team.slug) || !IS_PROD
          ? "/app/$team/flows"
          : "/app/$team/dashboard",
      params: { team: params.team },
    });
  },
});
