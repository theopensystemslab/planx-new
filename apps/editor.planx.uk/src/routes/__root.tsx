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

export const Route = createRootRouteWithContext<RouterContext>()({
  validateSearch: zodValidator(rootSearchSchema),
  pendingComponent: DelayedLoadingIndicator,

  beforeLoad: async ({ location }) => {
    // Redirect authenticated users to the /app base route
    if (location.pathname === "/") {
      throw redirect({
        to: "/app",
      });
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

    return <ErrorFallback error={error} />;
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
