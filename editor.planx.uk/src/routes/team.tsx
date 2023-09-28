import gql from "graphql-tag";
import { compose, lazy, mount, route, withData, withView } from "navi";
import React from "react";

import { client } from "../lib/graphql";
import { useStore } from "../pages/FlowEditor/lib/store";
import Team from "../pages/Team";
import { getTeamFromDomain, makeTitle } from "./utils";
import { teamView } from "./views/team";

let cached: { flowSlug?: string; teamSlug?: string } = {
  flowSlug: undefined,
  teamSlug: undefined,
};

const routes = compose(
  withData(async (req) => ({
    team:
    // TODO: drop this and point at store
      req.params.team || (await getTeamFromDomain(window.location.hostname)),
  })),

  withView(teamView),

  mount({
    "/": route(() => ({
      title: makeTitle(useStore.getState().teamName),
      view: <Team/>,
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
          }) as any;
        }

        useStore.getState().setFlowSlug(slug);
        await useStore.getState().connectTo(flow.id);
      }

      return import("./flow");
    }),
  }),
);

export default routes;
