import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Redirect - user likely using old PlanX link without the /app prefix
 */
export const Route = createFileRoute("/_public/_planXDomain/$team/$flow/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/app/$team/$flow",
      params: {
        flow: params.flow,
        team: params.team!,
      },
    });
  },
});
