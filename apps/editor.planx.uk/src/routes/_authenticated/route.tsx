import { createFileRoute, redirect } from "@tanstack/react-router";
import { useStore } from "pages/FlowEditor/lib/store";

import { validateDomain } from "./-loader";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    validateDomain();

    const { authStatus, initAuthStore } = useStore.getState();

    if (authStatus === "idle") {
      await initAuthStore();
    }

    if (useStore.getState().authStatus !== "authenticated") {
      throw redirect({
        to: "/login",
        search: { redirectTo: location.pathname },
        replace: true,
      });
    }
  },
  head: () => ({
    meta: [
      {
        name: "robots",
        content: "noindex, nofollow",
      },
      {
        name: "googlebot",
        content: "noindex, nofollow",
      },
    ],
  }),
});
