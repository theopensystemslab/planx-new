import type { SnakeCasedProperties } from "type-fest";

export interface SubmissionEmailInput {
  submissionEmail: string;
  defaultEmail: boolean;
  teamId: number;
}

export interface GetSubmissionEmails {
  submissionIntegrations: (SubmissionEmailInput & { id: number })[];
}

export type SubmissionEmailMutation = SnakeCasedProperties<
  Omit<SubmissionEmailInput, "id">
>;

export interface SubmissionEmailValues {
  submissionIntegrations: SubmissionEmailInput[];
}

export interface UpdateTeamSubmissionIntegrationsVariables {
  emails: SubmissionEmailMutation[];
}
