import gql from "graphql-tag";

export const GET_UNREAD_FEEDBACK_SUMMARY = gql`
  query GetUnreadFeedbackByTeam($teamSlug: String!) {
    feedback_summary(
      where: { team_slug: { _eq: $teamSlug }, status: { _eq: "unread" } }
    ) {
      flowName: service_name
    }
  }
`;
