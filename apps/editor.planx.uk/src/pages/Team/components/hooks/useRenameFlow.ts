import { useMutation } from "@apollo/client";

import {
  FlowStatusMutation,
  GET_FLOWS,
  RENAME_FLOW,
  RenameFlowMutationVars,
} from "../../queries";

export const useRenameFlow = (teamId: number) =>
  useMutation<FlowStatusMutation, RenameFlowMutationVars>(RENAME_FLOW, {
    refetchQueries: [{ query: GET_FLOWS, variables: { teamId } }],
  });
