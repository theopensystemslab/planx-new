import { ComponentType } from "@opensystemslab/planx-core/types";
import { Sentiment } from "components/Feedback/MoreInfoFeedback/MoreInfoFeedback";
import { FeedbackCategory } from "components/Feedback/types";
import gql from "graphql-tag";
import { compose, mount, NotFoundError, route, withData } from "navi";
import { FeedbackLog } from "pages/FlowEditor/components/Flow/FeedbackLog/FeedbackLog";
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
  address: string | null;
  feedbackScore: number;
  flowName: string;
}

const feedbackRoutes = compose(
  withData((req) => ({
    mountpath: req.mountpath,
  })),

  mount({
    "/": route(async (req) => {
      const { team: teamSlug } = req.params;

      const isAuthorised = useStore.getState().canUserEditTeam(teamSlug);
      if (!isAuthorised)
        throw new NotFoundError(
          `User does not have access to ${req.originalUrl}`
        );

      const {
        data: { feedback },
      } = await client.query<{ feedback: Feedback[] }>({
        query: gql`
          query GetFeedbackForTeam($teamSlug: String!) {
            feedback: feedback_summary(
              order_by: { created_at: asc }
              where: {
                team_slug: { _eq: $teamSlug }
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
        variables: { teamSlug },
      });

      return {
        title: makeTitle("Team Feedback"),
        view: <FeedbackLog feedback={feedback} />,
      };
    }),
  })
);

export default feedbackRoutes;
