import gql from "graphql-tag";
import {
  compose,
  lazy,
  map,
  mount,
  NotFoundError,
  redirect,
  route,
  withContext,
  withData,
  withView,
} from "navi";
import AdvancedSettings from "pages/FlowEditor/components/Settings/Team/Advanced";
import ContactSettings from "pages/FlowEditor/components/Settings/Team/Contact";
import DesignSettings from "pages/FlowEditor/components/Settings/Team/Design";
import GISSettings from "pages/FlowEditor/components/Settings/Team/GIS";
import IntegrationSettings from "pages/FlowEditor/components/Settings/Team/Integrations";
import TeamSettingsLayout from "pages/FlowEditor/components/Settings/Team/Layout";
import Team from "pages/Team";
import React from "react";
import { View } from "react-navi";
import NotionEmbed from "ui/editor/NotionEmbed";

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
    const { templatedFrom, ...rest } = data;
    useStore.setState({
      ...rest,
      flowSlug: request.params.flow,
      isTemplatedFrom: Boolean(templatedFrom),
    });
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
    "/": compose(
      withContext(async () => {
        // Clear any cached data from previous flows
        useStore.getState().resetPreview();
      }),

      route(() => ({
        title: makeTitle(useStore.getState().teamName),
        view: <Team />,
      })),
    ),

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

        useStore.setState({
          id: flow.id,
          flowName: flow.name,
          flowSlug: slug,
        });
      }

      return import("./flow");
    }),

    "/:flow/settings": setFlowAndLazyLoad(() => import("./serviceSettings")),

    "/:flow/feedback": setFlowAndLazyLoad(() => import("./serviceFeedback")),

    "/:flow/submissions": setFlowAndLazyLoad(
      () => import("./serviceSubmissions"),
    ),

    "/submissions": lazy(() => import("./submissions")),

    "/members": lazy(() => import("./teamMembers")),

    "/feedback": lazy(() => import("./feedback")),

    "/resources": route(() => {
      return {
        title: makeTitle("Resources"),
        view: <NotionEmbed page="resources" title="Resources" />,
      };
    }),

    "/onboarding": route(() => {
      return {
        title: makeTitle("Onboarding"),
        view: <NotionEmbed page="onboarding" title="Onboarding" />,
      };
    }),

    "/tutorials": route(() => {
      return {
        title: makeTitle("Tutorials"),
        view: <NotionEmbed page="tutorials" title="Tutorials" />,
      };
    }),

    "/settings": compose(
      withView(() => (
        <TeamSettingsLayout>
          <View />
        </TeamSettingsLayout>
      )),
      mount({
        "/": redirect("./contact"),
        "/contact": route((req) => ({
          title: makeTitle([req.params.team, "settings", "contact"].join("/")),
          view: <ContactSettings />,
        })),
        "/integrations": route((req) => ({
          title: makeTitle(
            [req.params.team, "settings", "integrations"].join("/"),
          ),
          view: <IntegrationSettings />,
        })),
        "/gis-data": route((req) => ({
          title: makeTitle([req.params.team, "settings", "gis-data"].join("/")),
          view: <GISSettings />,
        })),
        "/design": route((req) => ({
          title: makeTitle([req.params.team, "settings", "design"].join("/")),
          view: <DesignSettings />,
        })),
        "/advanced": route((req) => ({
          title: makeTitle([req.params.team, "settings", "advanced"].join("/")),
          view: <AdvancedSettings />,
        })),
      }),
    ),

    "/subscription": lazy(() => import("./subscription")),
  }),
);

export default routes;
