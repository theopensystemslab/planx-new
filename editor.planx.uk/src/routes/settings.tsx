import gql from "graphql-tag";
import { client } from "lib/graphql";
import { compose, mount, redirect, route, withData } from "navi";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import Settings from "../pages/FlowEditor/components/Settings";
import type { FlowSettings } from "../types";
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
          query GetFlow($slug: String!, $team_slug: String!) {
            flows(
              limit: 1
              where: {
                slug: { _eq: $slug }
                team: { slug: { _eq: $team_slug } }
              }
            ) {
              id
              settings
            }
          }
        `,
        variables: {
          slug: req.params.flow,
          team_slug: req.params.team,
        },
      });

      const settings: FlowSettings = data.flows[0].settings;
      useStore.getState().setFlowSettings(settings);

      return {
        title: makeTitle(
          [req.params.team, req.params.flow, "Settings"].join("/")
        ),
        view: <Settings tab={req.params.tab} />,
      };
    }),
  })
);

export default flowSettingsRoutes;
