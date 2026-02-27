import { SelectChangeEvent } from "@mui/material/Select";
import { SubmissionEmailInput } from "pages/FlowEditor/components/Settings/Team/Integrations/SubmissionEmails/types";

export interface GetFlowEmailIdQuery {
  flowIntegrations: Array<{
    emailId: string;
  }>;
}

export interface GetFlowEmailIdQueryVariables {
  flowId: string;
}

export interface UpdateFlowIntegrationMutation {
  update_flow_integrations: {
    affected_rows: number;
  };
}

export interface UpdateFlowIntegrationMutationVariables {
  flowId: string;
  emailId: string;
}

export interface GetTeamSubmissionIntegrationsQuery {
  submissionIntegrations: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

export interface GetTeamSubmissionIntegrationsQueryVariables {
  teamId: number;
}

export interface EmailEmptyStateProps {
  teamSlug: string;
  error?: string;
}

export interface EmailSelectionProps {
  teamSlug: string;
  emailOptions: Required<SubmissionEmailInput>[];
  currentEmail: Required<SubmissionEmailInput> | undefined;
  submissionEmailId: string | undefined;
  handleSelectChange: (event: SelectChangeEvent<unknown>) => void;
  disabled?: boolean;
}
