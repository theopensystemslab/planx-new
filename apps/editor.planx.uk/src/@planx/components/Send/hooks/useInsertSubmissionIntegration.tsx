import { useMutation } from "@apollo/client";
import { INSERT_TEAM_SUBMISSION_INTEGRATION } from "../queries";
import {
  SubmissionEmailInput,
  SubmissionEmailMutation,
} from "pages/FlowEditor/components/Settings/Team/Integrations/SubmissionEmails/types";

export const useInsertSubmissionIntegration = () => {
  return useMutation<SubmissionEmailMutation, SubmissionEmailInput>(
    INSERT_TEAM_SUBMISSION_INTEGRATION
  );
};
