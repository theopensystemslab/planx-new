import gql from "graphql-tag";
import { compose, lazy, mount, route, withView } from "navi";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import { client } from "../lib/graphql";
import GlobalSettingsView from "../pages/GlobalSettings";
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

    "/global-settings": route(async () => {
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
    }),

    "/:team": lazy(() => import("./team")),
  }),
);

const routes = mount({
  "*": editorRoutes,
});

export default routes;
