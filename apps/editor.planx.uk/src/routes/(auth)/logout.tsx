import { createFileRoute, redirect } from "@tanstack/react-router";
import { logout } from "lib/api/auth/requests";
import { clearCookie } from "lib/cookie";
import { disconnectShareDB } from "pages/FlowEditor/lib/sharedb";

import { client } from "../../lib/graphql";

export const Route = createFileRoute("/(auth)/logout")({
  beforeLoad: async () => {
    try {
      // httpOnly JWT cookie cleared via server headers
      await logout();
    } catch (error) {
      // Non-blocking - API may fail due to expired tokens, still need to proceed to local cleanup
      console.warn("Logout API call failed:", error);
    }

    // Clean up client-side state
    try {
      disconnectShareDB();
      await client.resetStore();
    } catch (err) {
      console.error("Failed to cleanup client state:", err);
    }

    // Clear the non-httpOnly cookies
    clearCookie("auth");
    clearCookie("session");
    clearCookie("session.sig");

    // Clear localStorage fallback (used for local dev/Pizzas)
    localStorage.removeItem("jwt");

    // Must throw redirect to trigger navigation
    throw redirect({ to: "/login", search: {}, replace: true });
  },
});
