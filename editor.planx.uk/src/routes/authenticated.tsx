import gql from "graphql-tag";
import {
  compose,
  lazy,
  map,
  mount,
  NotFoundError,
  route,
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
import { makeTitle } from "./utils";
import { authenticatedView } from "./views/authenticated";

const editorRoutes = compose(
  withView(authenticatedView),

  mount({
    "/": route(async () => {
      const { data } = await client.query({
        query: gql`
          query GetTeams {
            teams(order_by: { name: asc }) {
              id
              name
              slug
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
        view: <Teams teams={data.teams} teamTheme={data.teamThemes} />,
      };
    }),

    "/global-settings": map(async (req) => {
      const isAuthorised = useStore.getState().user?.isPlatformAdmin;
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

    "/admin-panel": map(async (req) => {
      const user = useStore.getState().user;
      if (!user) throw new NotFoundError();

      const { isPlatformAdmin, isAnalyst } = user;
      const isAuthorised = isPlatformAdmin || isAnalyst;
      if (!isAuthorised)
        throw new NotFoundError(
          `User does not have access to ${req.originalUrl}`,
        );

      return route(async () => {
        const { data } = await client.query<{ adminPanel: AdminPanelData[] }>({
          query: gql`
            query {
              adminPanel: teams_summary {
                id
                name
                slug
                referenceCode: reference_code
                homepage
                subdomain
                planningDataEnabled: planning_data_enabled
                article4sEnabled: article_4s_enabled
                govnotifyPersonalisation: govnotify_personalisation
                govpayEnabled: govpay_enabled
                powerAutomateEnabled: power_automate_enabled
                sendToEmailAddress: send_to_email_address
                bopsSubmissionURL: bops_submission_url
                liveFlows: live_flows
                logo
                favicon
                primaryColour: primary_colour
                linkColour: link_colour
                actionColour: action_colour
                isTrial: is_trial
              }
            }
          `,
          context: {
            headers: {
              "x-hasura-role": isPlatformAdmin ? "platformAdmin" : "analyst"
            }
          }
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
