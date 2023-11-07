import gql from "graphql-tag";
import { publicClient } from "lib/graphql";
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
      const { data } = await publicClient.query({
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
              flowSettings: settings
            }
          }
        `,
        variables: {
          slug: req.params.flow,
          team_slug: req.params.team,
        },
      });

      const flowSettings: FlowSettings = data.flows[0].flowSettings;
      useStore.setState({ flowSettings });

      return {
        title: makeTitle(
          [req.params.team, req.params.flow, "Settings"].join("/"),
        ),
        view: <Settings tab={req.params.tab} />,
      };
    }),
  }),
);

export default flowSettingsRoutes;
