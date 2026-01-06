import { gql } from "@apollo/client";

export const GET_TEAM_SUBMISSION_INTEGRATIONS = gql`
  query GetTeamSubmissionIntegrations($teamId: Int!) {
    submissionIntegrations: submission_integrations(
      where: { team_id: { _eq: $teamId } }
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

export const DELETE_TEAM_SUBMISSION_INTEGRATIONS = gql`
  mutation DeleteSubmissionIntegrations($emailIds: [uuid!]!) {
    delete_submission_integrations(
      where: { id: { _in: $emailIds }, default_email: { _eq: false } }
    ) {
      returning {
        id
        teamId: team_id
      }
    }
  }
`;
