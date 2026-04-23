import { useMutation } from "@apollo/client";

import {
  FlowStatusMutation,
  GET_ARCHIVED_FLOWS,
  GET_FLOWS,
  RENAME_AND_UNARCHIVE_FLOW,
  RenameFlowMutationVars,
} from "../../queries";

export const useRenameAndUnarchiveFlow = (teamId: number) =>
  useMutation<FlowStatusMutation, RenameFlowMutationVars>(
    RENAME_AND_UNARCHIVE_FLOW,
    {
      refetchQueries: [
        { query: GET_FLOWS, variables: { teamId } },
        { query: GET_ARCHIVED_FLOWS, variables: { teamId } },
      ],
    },
  );
