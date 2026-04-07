import { SelectChangeEvent } from "@mui/material/Select";
import { FormikErrors, FormikHelpers, FormikTouched } from "formik";
import { SubmissionEmailInput } from "pages/FlowEditor/components/Settings/Team/Integrations/SubmissionEmails/types";

import { Send } from "./model";

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

export interface InsertSubmissionEmailMutation {
  submissionIntegrations: {
    id: string;
    email: string;
    teamId: number;
    defaultEmail: boolean;
  };
}

export interface EmailSelectionProps {
  teamSlug: string;
  emailOptions: Required<SubmissionEmailInput>[];
  currentEmail: Required<SubmissionEmailInput> | undefined;
  submissionEmailId: string | undefined;
  handleSelectChange: (event: SelectChangeEvent<unknown>) => void;
  disabled?: boolean;
}
