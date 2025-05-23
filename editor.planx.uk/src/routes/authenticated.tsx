import type { Team, TeamSettings, TeamTheme, User } from "@opensystemslab/planx-core/types";
import gql from "graphql-tag";
import {
  compose,
  lazy,
  map,
  mount,
  NotFoundError,
  route,
  withContext,
  withView,
} from "navi";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { AdminPanelData } from "types";
import NotionEmbed from "ui/editor/NotionEmbed";

import { client } from "../lib/graphql";
import GlobalSettingsView from "../pages/GlobalSettings";
import { PlatformAdminPanel } from "../pages/PlatformAdminPanel/PlatformAdminPanel";
import Teams from "../pages/Teams";
import { makeTitle, PRODUCTION_ADMIN_PANEL_QUERY, STAGING_ADMIN_PANEL_QUERY } from "./utils";
import { authenticatedView } from "./views/authenticated";

export type TeamSummary =
  Pick<Team, "id" | "name" | "slug"> &
  { settings: Pick<TeamSettings, "isTrial"> } &
  { theme: Pick<TeamTheme, "primaryColour" | "logo"> }

interface Context {
  user: User
}

const editorRoutes = compose(
  withView(authenticatedView),

  /**
   * Ensure userStore is initialised
   * Required for route guards to avoid race conditions
   */
  withContext(async (): Promise<Context> => {
    const user = await useStore.getState().initUserStore();
    return { user }
  }),

  mount({
    "/": route(async () => {
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

      useStore.getState().clearTeamStore();

      return {
        title: makeTitle("Teams"),
        view: <Teams teams={data.teams} />,
      };
    }),

    "/global-settings": map<Context>(async (req, { user }) => {
      const isAuthorised = user.isPlatformAdmin;
      if (!isAuthorised)
        throw new NotFoundError(
          `User does not have access to ${req.originalUrl}`,
        );

      return route(async () => {
        const { data } = await client.query({
          query: gql`
            query {
              globalSettings: global_settings {
                footerContent: footer_content
              }
            }
          `,
        });
        useStore.getState().setGlobalSettings(data.globalSettings[0]);

        return {
          title: makeTitle("Global Settings"),
          view: <GlobalSettingsView />,
        };
      });
    }),

    "/admin-panel": map<Context>(async (req, { user }) => {
      const { isPlatformAdmin, isAnalyst } = user;
      const isAuthorised = isPlatformAdmin || isAnalyst;
      if (!isAuthorised)
        throw new NotFoundError(
          `User does not have access to ${req.originalUrl}`,
        );

      const query = import.meta.env.VITE_APP_ENV === "production"
        ? PRODUCTION_ADMIN_PANEL_QUERY
        : STAGING_ADMIN_PANEL_QUERY

      return route(async () => {
        const { data } = await client.query<{ adminPanel: AdminPanelData[] }>({
          query,
          context: {
            headers: {
              "x-hasura-role": isPlatformAdmin ? "platformAdmin" : "analyst",
            },
          },
        });
        useStore.getState().setAdminPanelData(data.adminPanel);

        return {
          title: makeTitle("Platform admin panel"),
          view: <PlatformAdminPanel />,
        };
      });
    }),

    "/resources": route(() => {
      return {
        title: makeTitle("Resources"),
        view: <NotionEmbed page="resources" title="Resources" />,
      };
    }),

    "/onboarding": route(() => {
      return {
        title: makeTitle("Onboarding"),
        view: <NotionEmbed page="onboarding" title="Onboarding" />,
      };
    }),

    "/tutorials": route(() => {
      return {
        title: makeTitle("Tutorials"),
        view: <NotionEmbed page="tutorials" title="Tutorials" />,
      };
    }),

    "/:team": lazy(() => import("./team")),
  }),
);

const routes = mount({
  "*": editorRoutes,
});

export default routes;
