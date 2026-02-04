import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_public/_customDomain/$flow/pay/invite/pages/$page",
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
