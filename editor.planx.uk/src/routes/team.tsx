import gql from "graphql-tag";
import { compose, lazy, mount, NotFoundError, route, withData } from "navi";
import React from "react";
import { client } from "../lib/graphql";
import { api } from "../pages/FlowEditor/lib/store";
import Team from "../pages/Team";
import { makeTitle } from "./utils";

let cached = {
  flowSlug: undefined,
  teamSlug: undefined,
};

const routes = compose(
  withData((req) => ({
    team: req.params.team,
  })),

  mount({
    "/": route(async (req) => {
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
              slug
              flows(order_by: { updated_at: desc }) {
                slug
                updated_at
              }
            }
          }
        `,
        variables: {
          slug: req.params.team,
        },
      });

      const team = data.teams[0];

      if (!team) throw new NotFoundError();

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

        if (!flow) throw new NotFoundError();

        await api.getState().connectTo(flow.id);
      }

      return import("./flow");
    }),
  })
);

export default routes;
