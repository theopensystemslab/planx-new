import { useMutation } from "@apollo/client";

import { UPDATE_FLOW_INTEGRATION } from "../queries";
import {
  UpdateFlowIntegrationMutation,
  UpdateFlowIntegrationMutationVariables,
} from "../types";

export const useUpdateFlowIntegration = () => {
  const mutation = useMutation<
    UpdateFlowIntegrationMutation,
    UpdateFlowIntegrationMutationVariables
  >(UPDATE_FLOW_INTEGRATION);

  return mutation;
};
