import { gql } from "@apollo/client";

export const GET_TEAM_SUBMISSION_INTEGRATIONS = gql`
  query GetTeamSubmissionIntegrations($team_id: Int!) {
    submissionIntegrations: submission_integrations(
      where: { team_id: { _eq: $team_id } }
    ) {
      teamId: team_id
      submissionEmail: submission_email
      defaultEmail: default_email
    }
  }
`;

export const CREATE_TEAM_SUBMISSION_INTEGRATIONS = gql`
  mutation InsertSubmissionIntegration {
    insert_submission_integrations(
      objects: { submission_email: $submission_email, team_id: $team_id }
    ) {
      returning {
        emailId: email_id
      }
    }
  }
`;

export const UPDATE_TEAM_SUBMISSION_INTEGRATIONS = gql`
  mutation UpdateSubmissionIntegration {
    update_submission_integrations_by_pk(pk_columns: { email_id: $email_id }) {
      submissionEmail: submission_email
      teamId: team_id
    }
  }
`;
