import { useMutation } from "@apollo/client";

import { UPDATE_FLOW_INTEGRATION } from "../queries";
import {
  UpdateFlowIntegrationMutation,
  UpdateFlowIntegrationMutationVariables,
} from "../types";

export const useUpdateFlowIntegration = () => {
  const [updateFlowIntegration, { data, loading, error }] = useMutation<
    UpdateFlowIntegrationMutation,
    UpdateFlowIntegrationMutationVariables
  >(UPDATE_FLOW_INTEGRATION);

  return { updateFlowIntegration, data, loading, error };
};
