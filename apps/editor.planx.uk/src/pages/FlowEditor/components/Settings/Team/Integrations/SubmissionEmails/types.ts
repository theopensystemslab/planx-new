import { ApolloQueryResult } from "@apollo/client";
import { SetStateAction } from "react";
import type { SnakeCasedProperties } from "type-fest";

export interface SubmissionEmail {
  address: string;
  isDefault: boolean;
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
  submissionEmails: SubmissionEmailWithFlows[];
}

export type SubmissionEmailMutation = {
  insertSubmissionEmailsOne: SnakeCasedProperties<SubmissionEmailInput>;
};

export interface SubmissionEmailInputs {
  submissionEmails: SubmissionEmailInput[];
}

export interface UpdateTeamSubmissionEmailsVariables {
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
      email?: SubmissionEmailInput;
    }
  | {
      type: "delete";
      email: SubmissionEmailWithFlows;
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
