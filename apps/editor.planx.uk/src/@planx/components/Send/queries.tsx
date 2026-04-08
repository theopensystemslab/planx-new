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

export const INSERT_TEAM_SUBMISSION_INTEGRATION = gql`
  mutation InsertSubmissionIntegration(
    $submissionEmail: String!
    $teamId: Int!
    $defaultEmail: Boolean!
  ) {
    insertSubmissionIntegrationsOne: insert_submission_integrations_one(
      object: {
        default_email: $defaultEmail
        submission_email: $submissionEmail
        team_id: $teamId
      }
    ) {
      default_email
      id
      submission_email
      team_id
    }
  }
`;
