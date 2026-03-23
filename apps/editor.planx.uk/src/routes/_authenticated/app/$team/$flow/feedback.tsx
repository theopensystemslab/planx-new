import { createFileRoute, notFound } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import gql from "graphql-tag";
import { FEEDBACK_SUMMARY_FIELDS } from "lib/feedback";
import { FeedbackLog } from "pages/FlowEditor/components/FeedbackLog/FeedbackLog";
import { Feedback } from "pages/FlowEditor/components/FeedbackLog/types";
import React from "react";

import { client } from "../../../../../lib/graphql";
import { useStore } from "../../../../../pages/FlowEditor/lib/store";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/feedback",
)({
  pendingComponent: DelayedLoadingIndicator,
  loader: async ({ params }) => {
    const { team: teamSlug, flow: flowSlug } = params;
    const actualFlowSlug = flowSlug.split(",")[0];

    const isAuthorised = useStore.getState().canUserEditTeam(teamSlug);
    if (!isAuthorised) {
      throw notFound();
    }

    try {
      const { data } = await client.query<{ feedback: Feedback[] }>({
        query: gql`
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

          ${FEEDBACK_SUMMARY_FIELDS}
        `,
        variables: { teamSlug, flowSlug: actualFlowSlug },
      });

      return {
        feedback: data.feedback,
      };
    } catch (error) {
      throw new Error(
        `Failed to load feedback: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
  component: FeedbackComponent,
});

function FeedbackComponent() {
  const { feedback } = Route.useLoaderData();

  return <FeedbackLog feedback={feedback} isFlowLevel={true} />;
}
