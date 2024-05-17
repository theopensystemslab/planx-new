import { ComponentType } from "@opensystemslab/planx-core/types";
import { FeedbackCategory } from "components/Feedback";
import { Sentiment } from "components/Feedback/MoreInfoFeedback";
import gql from "graphql-tag";
import { compose, mount, NotFoundError, route, withData } from "navi";
import { FeedbackPage } from "pages/FlowEditor/components/Flow/FeedbackPage";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import { client } from "../lib/graphql";
import { makeTitle } from "./utils";

type FeedbackType = Sentiment & FeedbackCategory;

export interface Feedback {
  id: number;
  type: FeedbackType;
  nodeTitle: string | null;
  nodeType: keyof typeof ComponentType | null;
  userComment: string | null;
  userContext: string | null;
  createdAt: string;
}

const feedbackRoutes = compose(
  withData((req) => ({
    mountpath: req.mountpath,
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
          query GetFeebackForFlow($teamSlug: String!, $flowSlug: String!) {
            feedback: feedback_summary(
              order_by: { created_at: asc }
              where: {
                team_slug: { _eq: $teamSlug }
                service_slug: { _eq: $flowSlug }
              }
            ) {
              id: feedback_id
              type: feedback_type
              nodeTitle: node_title
              nodeType: node_type
              userComment: user_comment
              userContext: user_context
              createdAt: created_at
            }
          }
        `,
        variables: { teamSlug, flowSlug },
      });

      return {
        title: makeTitle("Flow Feedback"),
        view: <FeedbackPage feedback={feedback} />,
      };
    }),
  }),
);

export default feedbackRoutes;