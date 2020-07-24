import gql from "graphql-tag";
import { compose, mount, NotFoundError, route, withData } from "navi";
import React from "react";
import { client } from "../lib/graphql";
import Flow from "../pages/Flow";
import { makeTitle } from "./utils";

const routes = compose(
  withData((req) => ({
    flow: req.params.flow,
  })),

  mount({
    "/": route(async (req) => {
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
        variables: {
          flowSlug: req.params.flow,
          teamSlug: req.params.team,
        },
      });

      const flow = data.flows[0];

      if (!flow) throw new NotFoundError();

      return {
        title: makeTitle([req.params.team, req.params.flow].join("/")),
        view: <Flow id={flow.id} />,
      };
    }),
  })
);

export default routes;
