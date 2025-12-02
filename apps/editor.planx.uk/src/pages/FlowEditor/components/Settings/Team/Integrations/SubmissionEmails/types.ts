export interface SubmissionEmail {
  submissionEmail: string;
  defaultEmail: boolean;
}

export interface SubmissionEmailFormValues {
  input: SubmissionEmail[];
  saved: SubmissionEmail[];
}

export interface GetTeamSubmissionIntegrationsData {
  submissionIntegrations: SubmissionEmail[];
}

export interface UpdateTeamSubmissionIntegrationsVariables {
  teamId: number;
  emails: SubmissionEmail[];
}
