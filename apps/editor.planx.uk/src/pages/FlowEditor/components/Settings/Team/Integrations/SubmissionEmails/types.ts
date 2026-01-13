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

export interface SubmissionEmailValues {
  submissionIntegrations: SubmissionEmailInput[];
}

export interface UpdateTeamSubmissionIntegrationsVariables {
  emails: SubmissionEmailMutation[];
}
