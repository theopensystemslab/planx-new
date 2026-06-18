import gql from "graphql-tag";

export const GET_UNREAD_FEEDBACK_SUMMARY = gql`
  query GetUnreadFeedbackByTeam($teamSlug: String!) {
    feedbackSummary: feedback_summary(
      where: { team_slug: { _eq: $teamSlug }, status: { _eq: "unread" } }
    ) {
      flowName: service_name
      flowSlug: service_slug
    }
  }
`;
