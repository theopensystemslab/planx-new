import gql from "graphql-tag";
import {
  compose,
  lazy,
  map,
  mount,
  NotFoundError,
  route,
  withContext,
  withData,
} from "navi";
import DesignSettings from "pages/FlowEditor/components/Settings/DesignSettings";
import GeneralSettings from "pages/FlowEditor/components/Settings/GeneralSettings";
import Team from "pages/Team";
import React from "react";

import { client } from "../lib/graphql";
import { useStore } from "../pages/FlowEditor/lib/store";
import { getTeamFromDomain, makeTitle } from "./utils";
import { getFlowEditorData } from "./views/flowEditor";

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

  withContext(async (req) => {
    const { initTeamStore, teamSlug: currentSlug } = useStore.getState();
    const routeSlug =
      req.params.team || (await getTeamFromDomain(window.location.hostname));

    if (currentSlug !== routeSlug) {
      try {
        await initTeamStore(routeSlug);
      } catch (error) {
        throw new NotFoundError(`Team not found: ${error}`);
      }
    }
  }),

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

    "/:flow/about": setFlowAndLazyLoad(() => import("./readMePage")),

    "/:flow/service": setFlowAndLazyLoad(() => import("./serviceSettings")),

    "/:flow/feedback": setFlowAndLazyLoad(() => import("./serviceFeedback")),

    "/:flow/submissions": setFlowAndLazyLoad(
      () => import("./serviceSubmissions"),
    ),

    "/submissions": lazy(() => import("./submissions")),

    "/members": lazy(() => import("./teamMembers")),

    "/design": compose(
      route(async (req) => ({
        title: makeTitle(
          [req.params.team, req.params.flow, "design"].join("/"),
        ),
        view: DesignSettings,
      })),
    ),

    "/feedback": lazy(() => import("./feedback")),

    "/general-settings": compose(
      route(async (req) => ({
        title: makeTitle(
          [req.params.team, req.params.flow, "settings"].join("/"),
        ),
        view: GeneralSettings,
      })),
    ),

    "/subscription": lazy(() => import("./subscription")),
  }),
);

export default routes;
