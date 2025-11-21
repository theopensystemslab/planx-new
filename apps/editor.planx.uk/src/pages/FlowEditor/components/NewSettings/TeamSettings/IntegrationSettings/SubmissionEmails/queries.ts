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

export const CREATE_TEAM_SUBMISSION_INTEGRATIONS = gql`
  mutation InsertSubmissionIntegration {
    insert_submission_integrations(
      objects: { submission_email: $submission_email, team_id: $team_id }
    ) {
      returning {
        id
      }
    }
  }
`;

export const UPDATE_TEAM_SUBMISSION_INTEGRATIONS = gql`
  mutation UpdateSubmissionIntegration {
    update_submission_integrations_by_pk(pk_columns: { id: $id }) {
      id
      submissionEmail: submission_email
      teamId: team_id
    }
  }
`;
