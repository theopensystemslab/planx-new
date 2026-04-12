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

export type SubmissionEmailMutation = {
  insertSubmissionIntegrationsOne: SnakeCasedProperties<SubmissionEmailInput>;
};

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

export type ModalState =
  | {
      type: "upsert";
      actionType: "add" | "edit";
      integration?: SubmissionEmailInput;
    }
  | {
      type: "delete";
      integration: SubmissionEmailWithFlows;
    }
  | null;

export interface EditorModalProps {
  modalState: ModalState;
  setModalState: React.Dispatch<SetStateAction<ModalState>>;
  currentEmails?: string[];
  refetch: (
    variables?: Partial<Record<string, any>>,
  ) => Promise<ApolloQueryResult<GetSubmissionEmails>>;
}
