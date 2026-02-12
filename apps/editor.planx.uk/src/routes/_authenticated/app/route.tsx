import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import React from "react";
import { CatchAllComponent } from "routes/$";

import { useStore } from "../../../pages/FlowEditor/lib/store";
import AuthenticatedLayout from "../../../pages/layout/AuthenticatedLayout";

// TODO: should this be a step higher?
export const Route = createFileRoute("/_authenticated/app")({
  pendingComponent: DelayedLoadingIndicator,
  beforeLoad: async () => {
    useStore.getState().setPreviewEnvironment("editor");
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
  component: () => (
    <AuthenticatedLayout>
      <Outlet />
    </AuthenticatedLayout>
  ),
  notFoundComponent: CatchAllComponent,
});
