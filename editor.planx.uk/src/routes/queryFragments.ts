import gql from "graphql-tag";

export const FEEDBACK_SUMMARY_FIELDS = gql`
  fragment FeedbackSummaryFields on feedback_summary {
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
`;
