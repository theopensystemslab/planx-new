import {
  createFileRoute,
  isRedirect,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import gql from "graphql-tag";
import React from "react";
import { CatchAllComponent } from "routes/$";

import { useStore } from "../../../pages/FlowEditor/lib/store";
import { TeamSummary } from "../../../pages/FlowEditor/lib/store/team";
import AuthenticatedLayout from "../../../pages/layout/AuthenticatedLayout";

export const Route = createFileRoute("/_authenticated/app")({
  pendingComponent: DelayedLoadingIndicator,
  loader: async () => {
    const { client } = await import("lib/graphql");
    const { data } = await client.query<{ teams: TeamSummary[] }>({
      query: gql`
        query GetTeamSummaries {
          teams(order_by: { name: asc }) {
            id
            name
            slug
            settings: team_settings {
              isTrial: is_trial
            }
            theme {
              primaryColour: primary_colour
              logo
            }
          }
        }
      `,
    });

    return {
      teams: data.teams,
    };
  },
  staleTime: Infinity,
  beforeLoad: async ({ location: { pathname } }) => {
    useStore.getState().setPreviewEnvironment("editor");

    const isInitialSessionLoad = !useStore.getState().user;

    try {
      const user = await useStore.getState().initUserStore();

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

      throw redirect({
        to: "/logout",
      });
    }
  },
  component: () => (
    <AuthenticatedLayout>
      <Outlet />
    </AuthenticatedLayout>
  ),
  notFoundComponent: CatchAllComponent,
});
