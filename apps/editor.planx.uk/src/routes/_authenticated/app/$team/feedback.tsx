import { createFileRoute, notFound } from "@tanstack/react-router";
import gql from "graphql-tag";
import { FEEDBACK_SUMMARY_FIELDS } from "lib/feedback";
import { client } from "lib/graphql";
import { FeedbackLog } from "pages/FlowEditor/components/FeedbackLog/FeedbackLog";
import { Feedback } from "pages/FlowEditor/components/FeedbackLog/types";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

export const Route = createFileRoute("/_authenticated/app/$team/feedback")({
  loader: async ({ params }) => {
    const isAuthorised = useStore.getState().canUserEditTeam(params.team);
    if (!isAuthorised) {
      throw notFound();
    }

    const {
      data: { feedback },
    } = await client.query<{ feedback: Feedback[] }>({
      query: gql`
        query GetFeedbackForTeam($teamSlug: String!) {
          feedback: feedback_summary(
            order_by: { created_at: desc }
            where: { team_slug: { _eq: $teamSlug } }
          ) {
            ...FeedbackSummaryFields
          }
        }

        ${FEEDBACK_SUMMARY_FIELDS}
      `,
      variables: { teamSlug: params.team },
      fetchPolicy: "no-cache",
    });

    return {
      feedback,
    };
  },
  component: FeedbackRoute,
});

function FeedbackRoute() {
  const { feedback } = Route.useLoaderData();
  return <FeedbackLog feedback={feedback} />;
}
