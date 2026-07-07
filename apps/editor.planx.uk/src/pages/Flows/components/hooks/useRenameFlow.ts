import { useMutation } from "@apollo/client";

import type {
  FlowMutationResponse,
  RenameFlowMutationVars,
} from "../../queries";
import { GET_FLOWS, RENAME_FLOW } from "../../queries";

export const useRenameFlow = (teamId: number) =>
  useMutation<FlowMutationResponse, RenameFlowMutationVars>(RENAME_FLOW, {
    refetchQueries: [{ query: GET_FLOWS, variables: { teamId } }],
  });
