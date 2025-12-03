export interface SubmissionEmail {
  submissionEmail: string;
  defaultEmail: boolean;
  teamId: number;
}

export interface SubmissionEmailMutation {
  submission_email: string;
  default_email: boolean;
  team_id: number;
}

export interface SubmissionEmailFormValues {
  input: SubmissionEmail[];
  saved: SubmissionEmail[];
}

export interface GetTeamSubmissionIntegrationsData {
  submissionIntegrations: SubmissionEmail[];
}

export interface UpdateTeamSubmissionIntegrationsVariables {
  emails: SubmissionEmailMutation[];
}
