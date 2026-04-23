import { useMutation } from "@apollo/client";

import {
  FlowMutationResponse,
  GET_FLOWS,
  RENAME_FLOW,
  RenameFlowMutationVars,
} from "../../queries";

export const useRenameFlow = (teamId: number) =>
  useMutation<FlowMutationResponse, RenameFlowMutationVars>(RENAME_FLOW, {
    refetchQueries: [{ query: GET_FLOWS, variables: { teamId } }],
  });
