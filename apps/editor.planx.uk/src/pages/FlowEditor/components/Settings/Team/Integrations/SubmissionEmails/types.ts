import { ApolloQueryResult } from "@apollo/client";
import { SetStateAction } from "react";
import type { SnakeCasedProperties } from "type-fest";

export interface SubmissionEmail {
  submissionEmail: string;
  defaultEmail: boolean;
  teamId: number;
  id: string;
}

export type SubmissionEmailInput = Omit<SubmissionEmail, "id"> & {
  id?: string;
};

export interface SubmissionEmailWithFlows extends Required<SubmissionEmail> {
  flows: Flow[] | [];
}

export interface GetSubmissionEmails {
  submissionIntegrations: SubmissionEmailWithFlows[];
}

export type SubmissionEmailMutation =
  SnakeCasedProperties<SubmissionEmailInput>;

export interface SubmissionEmailInputs {
  submissionIntegrations: SubmissionEmailInput[];
}

export interface UpdateTeamSubmissionIntegrationsVariables {
  emails: SubmissionEmailMutation[];
}

export type Flow = {
  id: string;
  slug: string;
  name: string;
};

export type ActionType = "add" | "edit" | "remove"; // TODO: refactor, this is a duplicate from "apps/editor.planx.uk/src/pages/FlowEditor/components/Team/types.ts"

export interface EditorModalProps {
  showModal?: boolean;
  setShowModal: React.Dispatch<SetStateAction<boolean>>;
  initialValues?: SubmissionEmailInput;
  actionType: ActionType;
  refetch: (
    variables?: Partial<Record<string, any>>,
  ) => Promise<ApolloQueryResult<GetSubmissionEmails>>;
}

export interface UpsertModalProps extends EditorModalProps {
  previousDefaultEmail?: SubmissionEmailInput;
  currentEmails?: string[];
}

export interface RemoveModalProps extends Omit<
  EditorModalProps,
  "initialValues"
> {
  initialValues: SubmissionEmailWithFlows;
}
