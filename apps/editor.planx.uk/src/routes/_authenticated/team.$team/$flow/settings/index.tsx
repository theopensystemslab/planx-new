import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/team/$team/$flow/settings/",
)({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/team/$team/$flow/settings/visibility",
      params: { team: params.team, flow: params.flow },
    });
  },
});
