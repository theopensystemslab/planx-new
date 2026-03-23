import { gql } from "@apollo/client";

export const GET_FLOW_EMAIL_ID = gql`
  query GetFlowEmailId($flowId: uuid!) {
    flows(where: { id: { _eq: $flowId } }) {
      submissionEmailId: submission_email_id
    }
  }
`;

export const UPDATE_FLOW_SUBMISSION_EMAIL_ID = gql`
  mutation UpdateFlowSubmissionEmailId($flowId: uuid!, $submissionEmailId: uuid!) {
    update_flows(where: {id: {_eq: $flowId}}, _set: {submission_email_id: $submissionEmailId}) {
      returning {
        submission_email_id
      }
    }
  }
`;
