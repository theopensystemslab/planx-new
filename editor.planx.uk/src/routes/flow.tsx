import gql from "graphql-tag";
import { compose, mount, NotFoundError, route, withData, withView } from "navi";
import React from "react";
import { View } from "react-navi";
import { client } from "../lib/graphql";
import FlowEditor from "../pages/FlowEditor";
import FormModal from "../pages/FlowEditor/components/forms/FormModal";
import Question from "../pages/FlowEditor/components/forms/Question";
import { makeTitle } from "./utils";

const newNode = route(async (req) => {
  const { type = "question" } = req.params;
  return {
    title: makeTitle(`New ${type}`),
    view: <FormModal type={type} Component={Question} />,
  };
});

const nodeRoutes = mount({
  "/new/:before": newNode,
  "/new": newNode,
  "/:parent/nodes/new/:before": newNode,
  "/:parent/nodes/new": newNode,
});

let cached = {
  params: undefined,
  id: undefined,
};

const routes = compose(
  withData((req) => ({
    flow: req.params.flow,
  })),

  withView(async (req) => {
    if (JSON.stringify(cached.params) !== JSON.stringify(req.params)) {
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

      cached.params = req.params;
      cached.id = flow.id;
    }

    return (
      <FlowEditor id={cached.id}>
        <View />
      </FlowEditor>
    );
  }),

  mount({
    "/": route(async (req) => {
      return {
        title: makeTitle([req.params.team, req.params.flow].join("/")),
        view: <span />,
      };
    }),

    "/nodes": nodeRoutes,
  })
);

export default routes;
