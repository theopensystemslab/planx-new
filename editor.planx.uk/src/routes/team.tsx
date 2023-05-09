import gql from "graphql-tag";
import { compose, lazy, mount, route, withData } from "navi";
import React from "react";

import { client } from "../lib/graphql";
import { useStore } from "../pages/FlowEditor/lib/store";
import Team from "../pages/Team";
import { getTeamFromDomain, makeTitle } from "./utils";

let cached: { flowSlug?: string; teamSlug?: string } = {
  flowSlug: undefined,
  teamSlug: undefined,
};

const routes = compose(
  withData(async (req) => ({
    team:
      req.params.team || (await getTeamFromDomain(window.location.hostname)),
  })),

  mount({
    "/": route(async (req) => {
      const { data } = await client.query({
        query: gql`
          query GetTeams($slug: String!) {
            teams(
              order_by: { name: asc }
              limit: 1
              where: { slug: { _eq: $slug } }
            ) {
              id
              name
              slug
              flows(order_by: { updated_at: desc }) {
                slug
                updated_at
                operations(limit: 1, order_by: { id: desc }) {
                  actor {
                    first_name
                    last_name
                  }
                }
              }
            }
          }
        `,
        variables: {
          slug: req.params.team,
        },
      });

      const team = data.teams[0];

      if (!team) {
        return {
          title: "Team Not Found",
          view: <p>Team not found</p>,
        };
      }

      return {
        title: makeTitle(team.name),
        view: <Team {...team} />,
      };
    }),

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
  })
);

export default routes;
