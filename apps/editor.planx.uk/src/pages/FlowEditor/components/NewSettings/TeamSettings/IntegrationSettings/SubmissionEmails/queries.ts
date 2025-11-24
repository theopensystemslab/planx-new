import { gql } from "@apollo/client";

export const GET_TEAM_SUBMISSION_INTEGRATIONS = gql`
  query GetTeamSubmissionIntegrations($teamId: Int!) {
    submissionIntegrations: submission_integrations(
      where: { team_id: { _eq: $teamId } }
    ) {
      teamId: team_id
      submissionEmail: submission_email
      defaultEmail: default_email
    }
  }
`;

export const UPSERT_TEAM_SUBMISSION_INTEGRATIONS = gql`
  mutation UpsertSubmissionIntegration(
    $submissionEmail: String!
    $teamId: Int!
    $defaultEmail: Boolean!
  ) {
    insert_submission_integrations(
      objects: {
        submission_email: $submissionEmail
        team_id: $teamId
        default_email: $defaultEmail
      }
      on_conflict: {
        constraint: submission_integrations_pkey
        update_columns: [submission_email]
      }
    ) {
      returning {
        id
        submissionEmail: submission_email
        teamId: team_id
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
