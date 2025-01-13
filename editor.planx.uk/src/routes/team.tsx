import gql from "graphql-tag";
import { compose, lazy, map, mount, route, withData, withView } from "navi";
import DesignSettings from "pages/FlowEditor/components/Settings/DesignSettings";
import GeneralSettings from "pages/FlowEditor/components/Settings/GeneralSettings";
import React from "react";

import { client } from "../lib/graphql";
import { useStore } from "../pages/FlowEditor/lib/store";
import Team from "../pages/Team";
import { makeTitle } from "./utils";
import { getFlowEditorData } from "./views/flowEditor";
import { teamView } from "./views/team";

let cached: { flowSlug?: string; teamSlug?: string } = {
  flowSlug: undefined,
  teamSlug: undefined,
};

const setFlowAndLazyLoad = (importComponent: Parameters<typeof lazy>[0]) => {
  return map(async (request) => {
    const data = await getFlowEditorData(
      request.params.flow,
      request.params.team,
    );
    useStore.setState({ ...data, flowSlug: request.params.flow });

    return lazy(importComponent);
  });
};

const routes = compose(
  withData((req) => ({
    team: req.params.team,
  })),

  withView(async (req) => await teamView(req)),

  mount({
    "/": route(() => ({
      title: makeTitle(useStore.getState().teamName),
      view: <Team />,
    })),

    "/:flow": lazy(async (req) => {
      const [slug] = req.params.flow.split(",");

      const variables = {
        flowSlug: slug,
        teamSlug: req.params.team,
      };

      if (JSON.stringify(cached) !== JSON.stringify(variables)) {
        cached = variables;

        const { data } = await client.query({
          query: gql`
            query GetFlow($flowSlug: String!, $teamSlug: String!) {
              flows(
                limit: 1
                where: {
                  slug: { _eq: $flowSlug }
                  team: { slug: { _eq: $teamSlug } }
                }
              ) {
                id
                name
              }
            }
          `,
          variables,
        });

        const flow = data.flows[0];

        if (!flow) {
          return route({
            title: "Flow Not Found",
            view: <p>Flow Not Found</p>,
          });
        }

        useStore.getState().setFlowName(flow.name);
        useStore.getState().setFlowSlug(slug);
        await useStore.getState().connectTo(flow.id);
      }

      return import("./flow");
    }),

    "/:flow/feedback": setFlowAndLazyLoad(() => import("./feedback")),

    "/:flow/about": setFlowAndLazyLoad(() => import("./readMePage")),

    "/:flow/service": setFlowAndLazyLoad(() => import("./serviceSettings")),

    "/:flow/submissions-log": setFlowAndLazyLoad(
      () => import("./submissionsLog"),
    ),

    "/members": lazy(() => import("./teamMembers")),
    "/design": compose(
      route(async (req) => ({
        title: makeTitle(
          [req.params.team, req.params.flow, "design"].join("/"),
        ),
        view: DesignSettings,
      })),
    ),
    "/general-settings": compose(
      route(async (req) => ({
        title: makeTitle(
          [req.params.team, req.params.flow, "settings"].join("/"),
        ),
        view: GeneralSettings,
      })),
    ),
  }),
);

export default routes;
