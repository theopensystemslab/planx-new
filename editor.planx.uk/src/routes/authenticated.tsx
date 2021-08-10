import camelcaseKeys from "camelcase-keys";
import gql from "graphql-tag";
import { compose, lazy, mount, route, withData, withView } from "navi";
import React from "react";
import { GlobalSettings, Maybe } from "types";

import AuthenticatedLayout from "../components/AuthenticatedLayout";
import { client } from "../lib/graphql";
import GlobalSettingsView from "../pages/GlobalSettings";
import Teams from "../pages/Teams";
import { makeTitle } from "./utils";

const editorRoutes = compose(
  withData((req) => ({
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
            global_settings {
              footer_content
            }
          }
        `,
      });

      const globalSettings: Maybe<GlobalSettings> = camelcaseKeys(
        data.global_settings[0]
      );

      return {
        title: makeTitle("Global Settings"),
        view: <GlobalSettingsView {...globalSettings} />,
      };
    }),

    "/:team": lazy(() => import("./team")),
  })
);

const routes = mount({
  "*": editorRoutes,
});

export default routes;
