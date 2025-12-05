import type { SnakeCasedProperties } from "type-fest";

export interface SubmissionEmail {
  submissionEmail: string;
  defaultEmail: boolean;
  teamId: number;
}

export type SubmissionEmailMutation = SnakeCasedProperties<SubmissionEmail>;

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
