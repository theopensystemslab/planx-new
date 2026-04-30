import { useMutation } from "@apollo/client";
import {
  SubmissionEmailInput,
  SubmissionEmailMutation,
} from "pages/FlowEditor/components/Settings/Team/Integrations/SubmissionEmails/types";

import { INSERT_TEAM_SUBMISSION_EMAIL } from "../queries";

export const useInsertSubmissionEmail = () => {
  return useMutation<SubmissionEmailMutation, SubmissionEmailInput>(
    INSERT_TEAM_SUBMISSION_EMAIL,
  );
};
