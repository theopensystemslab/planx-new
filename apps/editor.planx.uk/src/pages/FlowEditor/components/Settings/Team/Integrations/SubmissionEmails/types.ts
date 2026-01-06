import type { SnakeCasedProperties } from "type-fest";

export interface SubmissionEmailInput {
  submissionEmail: string;
  defaultEmail: boolean;
  teamId: number;
  id?: string;
}

export interface GetSubmissionEmails {
  submissionIntegrations: (SubmissionEmailInput & { id: string })[];
}

export type SubmissionEmailMutation =
  SnakeCasedProperties<SubmissionEmailInput>;

export interface SubmissionEmailFormValues {
  submissionIntegrations: SubmissionEmailInput[];
}

export interface UpdateTeamSubmissionIntegrationsVariables {
  emails: SubmissionEmailMutation[];
}

export interface DeleteSubmissionIntegrationsVariables {
  emailIds: string[];
}
