import gql from "graphql-tag";
import { client } from "lib/graphql";
import { compose, mount, redirect, route, withData } from "navi";
import React from "react";

import FlowSettings from "../pages/FlowEditor/components/Settings";
import { Settings } from "../pages/FlowEditor/components/Settings/model";
import { makeTitle } from "./utils";

const flowSettingsRoutes = compose(
  withData((req) => ({
    mountpath: req.mountpath,
  })),

  mount({
    "/": redirect("./team"),
    "/:tab": route(async (req) => {
      const { data } = await client.query({
        query: gql`
          query GetTeam($slug: String!) {
            teams(
              order_by: { name: asc }
              limit: 1
              where: { slug: { _eq: $slug } }
            ) {
              id
              name
              settings
            }
          }
        `,
        variables: {
          slug: req.params.team,
        },
      });

      const settings: Settings = data.teams[0].settings;

      return {
        title: makeTitle(
          [req.params.team, req.params.flow, "Settings"].join("/")
        ),
        view: <FlowSettings tab={req.params.tab} settings={settings} />,
      };
    }),
  })
);

export default flowSettingsRoutes;
