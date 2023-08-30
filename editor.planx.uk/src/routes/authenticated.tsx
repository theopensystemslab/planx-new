import gql from "graphql-tag";
import { compose, lazy, mount, route, withData, withView } from "navi";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import AuthenticatedLayout from "../components/AuthenticatedLayout";
import { client } from "../lib/graphql";
import GlobalSettingsView from "../pages/GlobalSettings";
import Teams from "../pages/Teams";
import { makeTitle } from "./utils";

const editorRoutes = compose(
  withData(() => ({
    // just putting anything here for now
    username: "A",
  })),

  withView(() => <AuthenticatedLayout />),

  mount({
    "/": route(async () => {
      const { data } = await client.query({
        query: gql`
          query {
            teams(order_by: { name: asc }) {
              id
              name
              slug
            }
          }
        `,
      });

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
