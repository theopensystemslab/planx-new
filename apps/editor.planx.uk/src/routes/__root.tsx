import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { zodValidator } from "@tanstack/zod-adapter";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import ErrorPage from "pages/ErrorPage/ErrorPage";
import React from "react";
import { createPortal } from "react-dom";
import { z } from "zod";

import { CatchAllComponent } from "./$";

// Search params schema for error handling and redirects
const rootSearchSchema = z.object({
  error: z.string().optional(),
  redirectTo: z.string().optional(),
});

export const Route = createRootRouteWithContext()({
  validateSearch: zodValidator(rootSearchSchema),
  pendingComponent: DelayedLoadingIndicator,
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
      {createPortal(<HeadContent />, document.head)}
      <Outlet />
      {import.meta.env.DEV && (
        <TanStackRouterDevtools position="bottom-right" />
      )}
    </>
  );
}
