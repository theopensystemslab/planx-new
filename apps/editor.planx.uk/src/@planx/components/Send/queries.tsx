import { gql, useQuery } from "@apollo/client";

export const GET_FLOW_EMAIL_ID = gql`
  query GetFlowEmailId($flowId: uuid!) {
    flowIntegrations: flow_integrations(where: { flow_id: { _eq: $flowId } }) {
      emailId: email_id
    }
  }
`;

export const INSERT_SUBMISSION_INTEGRATION = gql`
  mutation InsertSubmissionIntegration(
    $teamId: Int!
    $submissionEmail: String!
    $defaultEmail: Boolean!
  ) {
    insert_submission_integrations_one(
      object: {
        team_id: $teamId
        submission_email: $submissionEmail
        default_email: $defaultEmail
      }
    ) {
      team_id
      id
      submission_email
      default_email
    }
  }
`;

export const UPDATE_FLOW_INTEGRATION = gql`
  mutation UpdateFlowIntegration($flowId: uuid!, $emailId: uuid!) {
    update_flow_integrations(
      where: { flow_id: { _eq: $flowId } }
      _set: { email_id: $emailId }
    ) {
      affected_rows
    }
  }
`;
