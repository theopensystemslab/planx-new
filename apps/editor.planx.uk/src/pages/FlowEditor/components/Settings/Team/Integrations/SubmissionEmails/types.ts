import { ApolloQueryResult } from "@apollo/client";
import { SetStateAction } from "react";
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

export type GetFlowsWithSubmissionIntegration = {
  publishedFlows: {
    flowId: number;
    id: string;
    submissionEmailId: string;
    flow: {
      name: string;
      slug: string;
    } | null;
  }[];
};

export interface UpdateTeamSubmissionIntegrationsVariables {
  emails: SubmissionEmailMutation[];
}

export type ActionType = "add" | "edit" | "remove"; // TODO: refactor, this is a duplicate from "apps/editor.planx.uk/src/pages/FlowEditor/components/Team/types.ts"

export interface EditorModalProps {
  showModal?: boolean;
  setShowModal: React.Dispatch<SetStateAction<boolean>>;
  initialValues?: SubmissionEmailInput;
  actionType?: ActionType;
  previousDefaultEmail?: SubmissionEmailInput;
  currentEmails?: string[];
  teamId?: number;
  refetch: (variables?: Partial<Record<string, any>>) => Promise<ApolloQueryResult<GetSubmissionEmails>>;
}
