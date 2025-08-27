import {
  createRootRouteWithContext,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import React from "react";

interface RouterContext {
  currentUser?: boolean;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context, location }) => {
    // Allow login page and other public routes
    if (location.pathname === "/login") return {};
    if (!context.currentUser) {
      throw redirect({
        to: "/login",
        search: { redirectTo: location.pathname },
      });
    }
    return {};
  },
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
