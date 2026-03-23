import { useMutation } from "@apollo/client";

import { UPDATE_FLOW_SUBMISSION_EMAIL_ID } from "../queries";
import {
  UpdateFlowSubmissionEmailMutation,
  UpdateFlowSubmissionEmailMutationVariables,
} from "../types";

export const useUpdateFlowSubmissionEmail = () => {
  const mutation = useMutation<
    UpdateFlowSubmissionEmailMutation,
    UpdateFlowSubmissionEmailMutationVariables
  >(UPDATE_FLOW_SUBMISSION_EMAIL_ID);

  return mutation;
};
