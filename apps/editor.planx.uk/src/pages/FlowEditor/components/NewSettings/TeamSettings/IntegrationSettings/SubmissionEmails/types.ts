export interface SubmissionEmailFormValues {
  submissionEmail: string;
  defaultEmail: boolean;
}

export interface GetTeamSubmissionIntegrationsData {
  submissionIntegrations: {
    submissionEmail: string;
    defaultEmail: boolean;
  }[];
}

export interface UpdateTeamSubmissionIntegrationsVariables {
  teamId: number;
  submissionEmail: string;
  defaultEmail: boolean;
}
