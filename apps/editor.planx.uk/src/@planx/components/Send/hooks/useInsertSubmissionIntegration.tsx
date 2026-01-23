import { useMutation } from "@apollo/client";

import { INSERT_SUBMISSION_INTEGRATION } from "../queries";
import {
  InsertSubmissionIntegrationMutation,
  InsertSubmissionIntegrationMutationVariables,
} from "../types";

export const useInsertSubmissionIntegration = () => {
  const mutation = useMutation<
    InsertSubmissionIntegrationMutation,
    InsertSubmissionIntegrationMutationVariables
  >(INSERT_SUBMISSION_INTEGRATION);

  return mutation;
};
