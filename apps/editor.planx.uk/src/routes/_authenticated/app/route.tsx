import { createFileRoute, isRedirect, Outlet, redirect } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import React from "react";
import { CatchAllComponent } from "routes/$";

import { useStore } from "../../../pages/FlowEditor/lib/store";
import AuthenticatedLayout from "../../../pages/layout/AuthenticatedLayout";

export const Route = createFileRoute("/_authenticated/app")({
  pendingComponent: DelayedLoadingIndicator,
  beforeLoad: async ({ location: { pathname } }) => {
    useStore.getState().setPreviewEnvironment("editor");

    const isInitialSessionLoad = !useStore.getState().user;

    try {
      const user = await useStore.getState().initUserStore();

      if (!user) {
        throw redirect({
          to: "/login",
          search: {
            redirectTo: pathname !== "/app" ? pathname : undefined,
          },
        });
      }

      if (isInitialSessionLoad && pathname === "/app" && user.defaultTeamId) {
        const defaultTeam = user.teams.find(
          (t) => t.team.id === user.defaultTeamId,
        );

        if (defaultTeam) {
          throw redirect({
            to: "/app/$team",
            params: { team: defaultTeam.team.slug },
          });
        }
      }

      return { user, isPublicRoute: false };
    } catch (error) {
      if (isRedirect(error)) throw error;

      console.error("Failed to initialize user store:", error);
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