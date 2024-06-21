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

import { client } from "../lib/graphql";
import GlobalSettingsView from "../pages/GlobalSettings";
import AdminPanelView from "../pages/PlatformAdminPanel";
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
      const isAuthorised = useStore.getState().user?.isPlatformAdmin;
      if (!isAuthorised)
        throw new NotFoundError(
          `User does not have access to ${req.originalUrl}`,
        );

      return route(async () => {
        const { data } = await client.query({
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
                sendToEmailAddress: send_to_email_address
                bopsSubmissionURL: bops_submission_url
                logo
                favicon
                primaryColour: primary_colour
                linkColour: link_colour
                actionColour: action_colour
              }
            }
          `,
        });
        useStore.getState().setAdminPanelData(data.adminPanel);

        return {
          title: makeTitle("Platform Admin Panel"),
          view: <AdminPanelView />,
        };
      });
    }),

    "/:team": lazy(() => import("./team")),
  }),
);

const routes = mount({
  "*": editorRoutes,
});

export default routes;
