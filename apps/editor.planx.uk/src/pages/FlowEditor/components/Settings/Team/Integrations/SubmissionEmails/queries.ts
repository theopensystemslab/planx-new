import { gql } from "@apollo/client";

export const GET_FLOWS = gql`
  query GetFlows($flowIds: [uuid!]!) {
  flows(where: {id: {_in: $flowIds}}) {
    slug
    name
    id
  }
}
`;

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

export const GET_FLOW_IDS_BY_SUBMISSION_INTEGRATION = gql`
  query GetFlowIdsBySubmissionIntegration($emailId: uuid!) {
    flowIds: flows(
      where: { submission_email_id: { _eq: $emailId } }
    ) {
      flowId: id
    }
  }
`;

export const DELETE_TEAM_SUBMISSION_INTEGRATIONS = gql`
  mutation DeleteSubmissionIntegration(
    $submissionEmailId: uuid!
  ) {
    delete_submission_integrations(
      where: {
        id: { _eq: $submissionEmailId }
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