export interface SubmissionEmailInputValues {
  submissionEmail: string;
  defaultEmail: boolean;
}

export interface SubmissionEmailSavedValues {
  submissionEmail: string;
  defaultEmail: boolean;
}

export interface SubmissionEmailFormValues {
  input: SubmissionEmailInputValues;
  saved: {
    existingEmails: SubmissionEmailSavedValues[];
  };
}

export interface GetTeamSubmissionIntegrationsData {
  submissionIntegrations: {
    submissionEmail: string;
    defaultEmail: boolean;
  }[];
}

export interface UpdateTeamSubmissionIntegrationsVariables {
  teamId: number;
  emails: { submissionEmail: string; defaultEmail: boolean }[];
}
