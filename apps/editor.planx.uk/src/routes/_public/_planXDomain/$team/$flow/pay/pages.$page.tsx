import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_public/_planXDomain/$team/$flow/pay/pages/$page",
)({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/$team/$flow/published/pages/$page",
      params: {
        team: params.team,
        flow: params.flow,
        page: params.page,
      },
    });
  },
});
