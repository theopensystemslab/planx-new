import { User } from "@opensystemslab/planx-core/types";
import {
  createRootRouteWithContext,
  HeadContent,
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

const isPublicRoute = (pathname: string): boolean => {
  const publicRoutePatterns = [
    "/preview",
    "/published",
    "/draft",
    "/pages/",
    "/pay",
    "/download-application",
  ];

  return publicRoutePatterns.some((pattern) => pathname.includes(pattern));
};

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ location, context }) => {
    // Allow login route without authentication
    if (location.pathname === "/login") {
      return {};
    }

    // Check if this is a public route that doesn't need authentication
    if (isPublicRoute(location.pathname)) {
      return { isPublicRoute: true };
    }

    // Apply authentication for all other routes
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

      return { user, isPublicRoute: false };
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
      <HeadContent />
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  ),
});
