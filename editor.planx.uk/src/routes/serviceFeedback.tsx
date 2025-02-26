import gql from "graphql-tag";
import { compose, mount, NotFoundError, route, withData } from "navi";
import { FlowFeedback } from "pages/FlowEditor/components/Settings/FlowFeedback";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import { client } from "../lib/graphql";
import { Feedback } from "./feedback";
import { makeTitle } from "./utils";

const serviceFeedbackRoutes = compose(
  withData((req) => ({
    mountpath: req.mountpath,
    flow: req.params.flow,
  })),

  mount({
    "/": route(async (req) => {
      const { team: teamSlug, flow: flowSlug } = req.params;

      const isAuthorised = useStore.getState().canUserEditTeam(teamSlug);
      if (!isAuthorised)
        throw new NotFoundError(
          `User does not have access to ${req.originalUrl}`,
        );

      const {
        data: { feedback },
      } = await client.query<{ feedback: Feedback[] }>({
        query: gql`
          query GetFeedbackForFlow($teamSlug: String!, $flowSlug: String!) {
            feedback: feedback_summary(
              order_by: { created_at: desc }
              where: {
                team_slug: { _eq: $teamSlug }
                _and: { service_slug: { _eq: $flowSlug } }
              }
            ) {
              address
              createdAt: created_at
              feedbackScore: feedback_score
              flowName: service_name
              id: feedback_id
              nodeTitle: node_title
              nodeType: node_type
              type: feedback_type
              userComment: user_comment
              userContext: user_context
            }
          }
        `,
        variables: { teamSlug, flowSlug },
      });

      return {
        title: makeTitle("Service Feedback"),
        view: <FlowFeedback feedback={feedback} />,
      };
    }),
  }),
);

export default serviceFeedbackRoutes;
