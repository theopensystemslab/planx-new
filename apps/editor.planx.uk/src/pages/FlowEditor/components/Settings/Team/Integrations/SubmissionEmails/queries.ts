import { gql } from "@apollo/client";

export const GET_TEAM_SUBMISSION_EMAILS = gql`
  query GetTeamSubmissionEmails($teamId: Int!) {
    submissionEmails: submission_emails(
      where: { team_id: { _eq: $teamId } }
      order_by: { submission_email: asc }
    ) {
      teamId: team_id
      id
      address
      isDefault: is_default
      flows {
        id
        name
        slug
      }
    }
  }
`;

export const UPSERT_TEAM_SUBMISSION_EMAILS = gql`
  mutation UpsertSubmissionEmails(
    $emails: [submission_emails_insert_input!]!
  ) {
    insert_submission_emails(
      objects: $emails
      on_conflict: {
        constraint: submission_emails_pkey
        update_columns: [address, is_default]
      }
    ) {
      returning {
        id
        address
        teamId: team_id
        isDefault: is_default
      }
    }
  }
`;

export const DELETE_TEAM_SUBMISSION_EMAILS = gql`
  mutation DeleteSubmissionEmail($submissionEmailId: uuid!) {
    delete_submission_emails(
      where: { id: { _eq: $submissionEmailId }, is_default: { _eq: false } }
    ) {
      returning {
        teamId: team_id
        address
        isDefault: is_default
      }
    }
  }
`;
