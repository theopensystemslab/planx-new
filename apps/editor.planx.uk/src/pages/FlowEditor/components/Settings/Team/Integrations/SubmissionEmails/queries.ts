import { gql } from "@apollo/client";

export const GET_TEAM_SUBMISSION_INTEGRATIONS = gql`
  query GetTeamSubmissionIntegrations($teamId: Int!) {
    submissionIntegrations: submission_integrations(
      where: { team_id: { _eq: $teamId } }
      order_by: { submission_email: asc }
    ) {
      teamId: team_id
      id
      submissionEmail: submission_email
      defaultEmail: default_email
    }
  }
`;

export const GET_FLOW_IDS_BY_SUBMISSION_INTEGRATION = gql`
  query GetFlowIdsBySubmissionIntegration($emailId: uuid!) {
    flowIds: published_flows(
      where: { submission_email_id: { _eq: $emailId } }
      distinct_on: flow_id
    ) {
      flowId: flow_id
    }
  }
`;

export const GET_LATEST_PUBLISHED_FLOWS = gql`
  query GetLatestPublishedFlows($emailId: uuid!, $flowIds: [uuid!]!) {
    publishedFlows: published_flows(
      where: {
        submission_email_id: { _eq: $emailId }
        flow_id: { _in: $flowIds }
      }
      order_by: [{ flow_id: asc }, { created_at: desc }]
    ) {
      flowId: flow_id
      submissionEmailId: submission_email_id
      flow {
        name
        slug
      }
    }
  }
`;

export const UPSERT_TEAM_SUBMISSION_INTEGRATIONS = gql`
  mutation UpsertSubmissionIntegrations(
    $emails: [submission_integrations_insert_input!]!
  ) {
    insert_submission_integrations(
      objects: $emails
      on_conflict: {
        constraint: submission_integrations_pkey
        update_columns: [submission_email, default_email]
      }
    ) {
      returning {
        id
        submissionEmail: submission_email
        teamId: team_id
        defaultEmail: default_email
      }
    }
  }
`;

export const DELETE_TEAM_SUBMISSION_INTEGRATIONS = gql`
  mutation DeleteSubmissionIntegration(
    $submissionEmail: String!
    $teamId: Int!
  ) {
    delete_submission_integrations(
      where: {
        submission_email: { _eq: $submissionEmail }
        team_id: { _eq: $teamId }
        default_email: { _eq: false }
      }
    ) {
      returning {
        teamId: team_id
        submissionEmail: submission_email
        defaultEmail: default_email
      }
    }
  }
`;
