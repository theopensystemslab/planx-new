import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_public/_planXDomain/$team/$flow/pay/pages/$page",
)({
  loader: ({ params, context }) => {
    throw redirect({
      to: "/$team/$flow/published/pages/$page",
      params: {
        team: context.team,
        flow: params.flow,
        page: params.page,
      },
    });
  },
});
