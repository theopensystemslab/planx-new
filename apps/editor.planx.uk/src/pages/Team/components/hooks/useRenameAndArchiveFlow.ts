import { useMutation } from "@apollo/client";

import type {
  FlowMutationResponse,
  RenameFlowMutationVars,
} from "../../queries";
import {
  GET_ARCHIVED_FLOWS,
  GET_FLOWS,
  RENAME_AND_UNARCHIVE_FLOW,
} from "../../queries";

export const useRenameAndUnarchiveFlow = (teamId: number) =>
  useMutation<FlowMutationResponse, RenameFlowMutationVars>(
    RENAME_AND_UNARCHIVE_FLOW,
    {
      refetchQueries: [
        { query: GET_FLOWS, variables: { teamId } },
        { query: GET_ARCHIVED_FLOWS, variables: { teamId } },
      ],
    },
  );
