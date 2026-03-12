import { gql } from "@apollo/client";

export const GET_FLOW_EMAIL_ID = gql`
  query GetFlowEmailId($flowId: uuid!) {
    flowsByPK: flows_by_pk(id: $flowId) {
      submissionEmailId: submission_email_id
    }
  }
`;

export const UPDATE_FLOW_SUBMISSION_EMAIL_ID = gql`
  mutation UpdateFlowSubmissionEmailId(
    $flowId: uuid!
    $submissionEmailId: uuid!
  ) {
    update_flows_by_pk(
      pk_columns: { id: $flowId }
      _set: { submission_email_id: $submissionEmailId }
    ) {
      id
      submission_email_id
    }
  }
`;
