import {
  createRootRouteWithContext,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import React from "react";

interface RouterContext {
  currentUser?: boolean | void;
}

export const Route = createRootRouteWithContext<RouterContext>()({
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
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  ),
});
