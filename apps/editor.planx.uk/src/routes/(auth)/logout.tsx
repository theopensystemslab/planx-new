import { createFileRoute, redirect } from "@tanstack/react-router";
import axios from "axios";
import { disconnectShareDB } from "pages/FlowEditor/lib/sharedb";

import { client } from "../../lib/graphql";

export const Route = createFileRoute("/(auth)/logout")({
  beforeLoad: async () => {
    // Call backend logout endpoint if token exists
    try {
      const token = localStorage.getItem("jwt");
      if (token) {
        const authRequestHeader = { Authorization: `Bearer ${token}` };
        await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/auth/logout`,
          null,
          {
            headers: authRequestHeader,
          },
        );
      }
    } catch (error) {
      console.warn("Logout API call failed:", error);
    }

    // Clean up client-side state
    try {
      disconnectShareDB();
      await client.resetStore();
    } catch (err) {
      console.error("Failed to cleanup client state:", err);
    }

    // Clear cookies
    const cookieString = `auth=; jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    // remove jwt cookie for non planx domains (netlify preview urls)
    document.cookie = cookieString;
    // remove jwt cookie for planx domains (staging and production)
    document.cookie = cookieString.concat(` domain=.${window.location.host};`);

    // Clear localStorage
    localStorage.removeItem("jwt");

    // Must throw redirect to trigger navigation
    throw redirect({ to: "/login", search: {}, replace: true });
  },
});
