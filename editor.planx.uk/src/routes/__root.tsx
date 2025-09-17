import { User } from "@opensystemslab/planx-core/types";
import {
  createRootRouteWithContext,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

interface RouterContext {
  currentUser?: boolean | void;
  user?: User;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ location, context }) => {
    // Allow login route without authentication
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

    try {
      const user = await useStore.getState().initUserStore();

      if (!user) {
        throw redirect({
          to: "/login",
          search: {
            redirectTo:
              location.pathname !== "/" ? location.pathname : undefined,
          },
        });
      }

      return { user };
    } catch (error) {
      console.error("Failed to initialize user store:", error);

      throw redirect({
        to: "/login",
        search: {
          redirectTo: location.pathname !== "/" ? location.pathname : undefined,
        },
      });
    }
  },
  component: () => (
    <>
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  ),
});
