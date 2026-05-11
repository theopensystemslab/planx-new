import { createFileRoute, redirect } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { useStore } from "pages/FlowEditor/lib/store";
import Login from "pages/Login/Login";
import {
  isSecureLocalRedirect,
  REDIRECT_KEY,
} from "utils/routeUtils/redirectUtils";
import { z } from "zod";

const loginSearchSchema = z.object({
  redirectTo: z.string().optional(),
});

export const Route = createFileRoute("/(auth)/login")({
  validateSearch: loginSearchSchema,
  beforeLoad: async ({ search }) => {
    // store redirectTo in sessionStorage so we can access it after oauth returns
    if (search.redirectTo) {
      sessionStorage.setItem(REDIRECT_KEY, search.redirectTo);
    }

    const { authStatus, initAuthStore } = useStore.getState();
    if (authStatus === "idle") {
      await initAuthStore();
    }

    if (useStore.getState().authStatus === "authenticated") {
      const pendingRedirect = sessionStorage.getItem(REDIRECT_KEY);
      sessionStorage.removeItem(REDIRECT_KEY);
      throw redirect({
        to: isSecureLocalRedirect(pendingRedirect) ? pendingRedirect! : "/app",
        replace: true,
      });
    }
  },
  component: Login,
  pendingComponent: DelayedLoadingIndicator,
});
