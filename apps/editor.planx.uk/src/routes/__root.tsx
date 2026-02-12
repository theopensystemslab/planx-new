import { User } from "@opensystemslab/planx-core/types";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { zodValidator } from "@tanstack/zod-adapter";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import ErrorFallback from "components/Error/ErrorFallback";
import ErrorPage from "pages/ErrorPage/ErrorPage";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { z } from "zod";

import { CatchAllComponent } from "./$";

interface RouterContext {
  currentUser?: boolean | void;
  user?: User;
}

// Search params schema for error handling and redirects
const rootSearchSchema = z.object({
  error: z.string().optional(),
  redirectTo: z.string().optional(),
});

const isPublicRoute = (pathname: string): boolean => {
  // Public routes follow the pattern: /:team/:flow/[public-route-type]
  // or for custom domains: /:flow/[public-route-type]

  const publicRouteRegexes = [
    /^\/[^/]+\/[^/]+\/preview($|\/)/, // /:team/:flow/preview/*
    /^\/[^/]+\/[^/]+\/published($|\/)/, // /:team/:flow/published/*
    /^\/[^/]+\/[^/]+\/draft($|\/)/, // /:team/:flow/draft/*
    /^\/[^/]+\/[^/]+\/pay($|\/)/, // /:team/:flow/pay/*
    /^\/[^/]+\/[^/]+\/[^/]+\/download-application($|\/)/, // /:team/:flow/:session/download-application/*
    /^\/[^/]+\/preview($|\/)/, // /:flow/preview/* (custom domains)
    /^\/[^/]+\/published($|\/)/, // /:flow/published/* (custom domains)
    /^\/[^/]+\/draft($|\/)/, // /:flow/draft/* (custom domains)
    /^\/[^/]+\/pay($|\/)/, // /:flow/pay/* (custom domains)
  ];

  return publicRouteRegexes.some((regex) => regex.test(pathname));
};

export const Route = createRootRouteWithContext<RouterContext>()({
  validateSearch: zodValidator(rootSearchSchema),
  pendingComponent: DelayedLoadingIndicator,

  beforeLoad: async ({ location, context }) => {
    if (location.pathname === "/login") {
      return {};
    }

    if (isPublicRoute(location.pathname)) {
      return { isPublicRoute: true };
    }

    if (!context.currentUser) {
      throw redirect({
        to: "/login",
        search: {
          redirectTo: location.pathname !== "/" ? location.pathname : undefined,
        },
      });
    }

    // Redirect authenticated users to the /app base route
    if (location.pathname === "/") {
      throw redirect({
        to: "/app",
      });
    }

    try {
      const user = await useStore.getState().initUserStore();

      if (!user) {
        throw redirect({
          to: "/login",
          search: {
            redirectTo:
              location.pathname !== "/app" ? location.pathname : undefined,
          },
        });
      }

      return { user, isPublicRoute: false };
    } catch (error) {
      console.error("Failed to initialize user store:", error);

      // handleExpiredJWTErrors() has already been called and will redirect
      // Return empty context to prevent error boundary from triggering
      return { authError: true };
    }
  },

  errorComponent: ({ error }) => {
    if (
      error?.message?.includes("not found") ||
      error?.message?.includes("404")
    ) {
      return (
        <ErrorPage title="Page not found">
          The page you're looking for doesn't exist or you don't have permission
          to access it.
        </ErrorPage>
      );
    }

    if (
      error?.message?.includes("permission") ||
      error?.message?.includes("access")
    ) {
      return (
        <ErrorPage title="Access denied">
          You don't have permission to access this page. Please contact your
          administrator if you believe this is an error.
        </ErrorPage>
      );
    }

    throw error;
  },

  notFoundComponent: CatchAllComponent,

  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  );
}
