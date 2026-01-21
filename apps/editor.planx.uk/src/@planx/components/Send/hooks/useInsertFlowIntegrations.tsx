import { useMutation } from "@apollo/client";

import { INSERT_FLOW_INTEGRATION } from "../queries";
import {
  InsertFlowIntegrationMutation,
  InsertFlowIntegrationMutationVariables,
} from "../types";

export const useInsertFlowIntegration = () => {
  const mutation = useMutation<
    InsertFlowIntegrationMutation,
    InsertFlowIntegrationMutationVariables
  >(INSERT_FLOW_INTEGRATION);

  return mutation;
};
