import gql from "graphql-tag";
import { compose, mount, NotFoundError, route, withData } from "navi";
import { FeedbackLog } from "pages/FlowEditor/components/Flow/FeedbackLog/FeedbackLog";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import { client } from "../lib/graphql";
import { Feedback } from "./feedback";
import { FEEDBACK_SUMMARY_FIELDS } from "./queryFragments";
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
          ${FEEDBACK_SUMMARY_FIELDS}
          query GetFeedbackForFlow($teamSlug: String!, $flowSlug: String!) {
            feedback: feedback_summary(
              order_by: { created_at: desc }
              where: {
                team_slug: { _eq: $teamSlug }
                _and: { service_slug: { _eq: $flowSlug } }
              }
            ) {
              ...FeedbackSummaryFields
            }
          }
        `,
        variables: { teamSlug, flowSlug },
      });

      return {
        title: makeTitle("Service feedback"),
        view: <FeedbackLog feedback={feedback} />,
      };
    }),
  }),
);

export default serviceFeedbackRoutes;
