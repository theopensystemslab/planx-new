import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/app/global-settings/")({
  beforeLoad: async () => {
    throw redirect({ to: "/app/global-settings/footer" });
  },
});
