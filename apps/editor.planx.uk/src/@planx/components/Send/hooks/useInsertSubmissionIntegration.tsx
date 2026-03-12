import { useMutation } from "@apollo/client";
import { INSERT_TEAM_SUBMISSION_INTEGRATION } from "pages/FlowEditor/components/Settings/Team/Integrations/SubmissionEmails/queries";
import {
  SubmissionEmailInput,
  SubmissionEmailMutation,
} from "pages/FlowEditor/components/Settings/Team/Integrations/SubmissionEmails/types";

export const useInsertSubmissionIntegration = (
  submissionEmail: string,
  defaultEmail: boolean,
  teamId: number,
) => {
  const query = useMutation<SubmissionEmailMutation, SubmissionEmailInput>(
    INSERT_TEAM_SUBMISSION_INTEGRATION,
    {
      variables: { teamId, submissionEmail, defaultEmail },
    },
  );

  return query;
};
