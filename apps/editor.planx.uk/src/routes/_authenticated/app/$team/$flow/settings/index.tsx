import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/settings/",
)({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/app/$team/$flow/settings/visibility",
      params: { team: params.team, flow: params.flow },
    });
  },
});
