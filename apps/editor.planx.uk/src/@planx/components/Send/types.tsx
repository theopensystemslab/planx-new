import { SelectChangeEvent } from "@mui/material/Select";
import { SubmissionEmailInput } from "pages/FlowEditor/components/Settings/Team/Integrations/SubmissionEmails/types";

export interface GetFlowEmailIdQuery {
  flowsByPK: {
    submissionEmailId: string;
  };
}

export interface GetFlowEmailIdQueryVariables {
  flowId: string;
}

export interface UpdateFlowSubmissionEmailMutation {
  update_flow_submission_email_id: {
    affected_rows: number;
  };
}

export interface UpdateFlowSubmissionEmailMutationVariables {
  flowId: string;
  submissionEmailId: string;
}

export interface GetTeamSubmissionEmailsQuery {
  submissionEmails: Array<{
    id: string;
    name: string;
    address: string;
  }>;
}

export interface GetTeamSubmissionEmailsQueryVariables {
  teamId: number;
}

export interface InsertSubmissionEmailMutation {
  submissionEmails: {
    id: string;
    address: string;
    teamId: number;
    isDefault: boolean;
  };
}

export interface EmailSelectionProps {
  teamSlug: string;
  emailOptions: Required<SubmissionEmailInput>[];
  submissionEmailId: string | undefined;
  handleSelectChange: (event: SelectChangeEvent<unknown>) => void;
  disabled?: boolean;
}
