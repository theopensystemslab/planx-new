import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/team/$team/settings/")({
  beforeLoad: async ({ params }) => {
    throw redirect({
      to: "/team/$team/settings/contact",
      params: { team: params.team },
    });
  },
});
