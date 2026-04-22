import { useMutation } from "@apollo/client";

import {
  FlowStatusMutation,
  GET_ARCHIVED_FLOWS,
  GET_FLOWS,
  RENAME_AND_UNARCHIVE_FLOW,
  RenameAndUnarchiveMutationVars,
} from "../../queries";

export const useRenameAndUnarchiveFlow = (flowId: string, teamId: number) =>
  useMutation<FlowStatusMutation, RenameAndUnarchiveMutationVars>(
    RENAME_AND_UNARCHIVE_FLOW,
    {
      refetchQueries: [
        { query: GET_FLOWS, variables: { teamId } },
        { query: GET_ARCHIVED_FLOWS, variables: { teamId } },
      ],
    },
  );
