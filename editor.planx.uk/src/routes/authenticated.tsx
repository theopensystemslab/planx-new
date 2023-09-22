import { User } from "@opensystemslab/planx-core/types";
import gql from "graphql-tag";
import jwtDecode from "jwt-decode";
import { getCookie } from "lib/cookie";
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
    username: useStore.getState().getUser().firstName,
  })),

  withView(() => <AuthenticatedLayout />),

  mount({
    "/": route(async () => {
      const jwt = getCookie("jwt");
      const email = jwt && (jwtDecode(jwt) as any)["email"];
      const users = await client.query({
        query: gql`
          query GetUserByEmail($email: String!) {
            users: users(where: { email: { _eq: $email } }) {
              id
              firstName: first_name
              lastName: last_name
              email
              isPlatformAdmin: is_platform_admin
              teams {
                role
                team {
                  name
                  slug
                  id
                }
              }
            }
          }
        `,
        variables: { email },
      });

      if (users) {
        const user: User = users.data.users[0];
        useStore.getState().setUser(user);
      } else {
        throw new Error(`Failed to get user ${email}`);
      }

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
