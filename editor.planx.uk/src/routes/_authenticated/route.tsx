import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ location, context }) => {
    if (location.pathname === "/login") {
      return {};
    }

    if (!context.currentUser) {
      throw redirect({
        to: "/login",
        search: {
          redirectTo: location.pathname !== "/" ? location.pathname : undefined,
        },
      });
    }

    return {};
  },
  component: () => (
    <>
      <Outlet />
    </>
  ),
});
