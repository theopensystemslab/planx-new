import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/app/$team/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/app/$team/dashboard",
      params: { team: params.team },
    });
  },
});
