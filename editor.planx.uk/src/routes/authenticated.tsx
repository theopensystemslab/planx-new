import gql from "graphql-tag";
import { compose, lazy, mount, route, withData, withView } from "navi";
import React from "react";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import { client } from "../lib/graphql";
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

    "/:team": lazy(() => import("./team")),
  })
);

const routes = mount({
  "*": editorRoutes,
});

export default routes;
