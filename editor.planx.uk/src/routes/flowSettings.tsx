import gql from "graphql-tag";
import { publicClient } from "lib/graphql";
import {
  compose,
  map,
  mount,
  NotFoundError,
  redirect,
  route,
  withData,
} from "navi";
import DataManagerSettings from "pages/FlowEditor/components/Settings/DataManagerSettings";
import ServiceFlags from "pages/FlowEditor/components/Settings/ServiceFlags";
import ServiceSettings from "pages/FlowEditor/components/Settings/ServiceSettings";
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
    "/": redirect("./service"),
    "/:tab": map(async (req) => {
      const isAuthorised = useStore.getState().canUserEditTeam(req.params.team);
      if (!isAuthorised)
        throw new NotFoundError(
          `User does not have access to ${req.originalUrl}`,
        );

      return route(async (req) => {
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
            [req.params.team, req.params.flow, "Flow Settings"].join("/"),
          ),
          view: (
            <Settings
              currentTab={req.params.tab}
              tabs={[
                {
                  name: "Service",
                  route: "service",
                  Component: ServiceSettings,
                },
                {
                  name: "Service Flags",
                  route: "flags",
                  Component: ServiceFlags,
                },
                {
                  name: "Data",
                  route: "data-manager",
                  Component: DataManagerSettings,
                },
              ]}
            />
          ),
        };
      });
    }),
  }),
);

export default flowSettingsRoutes;
