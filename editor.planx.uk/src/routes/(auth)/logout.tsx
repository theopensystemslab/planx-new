import { createFileRoute, redirect } from "@tanstack/react-router";
import axios from "axios";
import React, { useEffect } from "react";

import { client } from "../../lib/graphql";

export const Route = createFileRoute("/(auth)/logout")({
  beforeLoad: async () => {
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

    try {
      await client.resetStore();
    } catch (error) {
      console.warn("Failed to reset Apollo store:", error);
    }

    throw redirect({ to: "/login" });
  },
  component: LogoutPage,
});

function LogoutPage() {
  useEffect(() => {
    window.location.href = "/login";
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <p>Logging out...</p>
    </div>
  );
}
