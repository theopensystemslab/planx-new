import gql from "graphql-tag";
import { compose, mount, NotFoundError, route, withData } from "navi";
import React from "react";
import { client } from "../lib/graphql";
import FlowEditor from "../pages/FlowEditor";
import FormModal from "../pages/FlowEditor/components/forms/FormModal";
import Question from "../pages/FlowEditor/components/forms/Question";
import { makeTitle } from "./utils";

const newNode = route(async (req) => {
  const { type = "question" } = req.params;
  return {
    title: makeTitle(`New ${type}`),
    view: (
      <FormModal type={type}>
        <Question
          handleSubmit={(e) => {
            e.preventDefault();
          }}
        />
      </FormModal>
    ),
  };
});

const nodeRoutes = mount({
  "/new/:before": newNode,
  "/new": newNode,
  "/:parent/nodes/new/:before": newNode,
  "/:parent/nodes/new": newNode,
});

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
        view: <FlowEditor id={flow.id} />,
      };
    }),

    "/nodes": nodeRoutes,
  })
);

export default routes;
