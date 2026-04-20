import { useMutation } from "@apollo/client";

import {
  FlowStatusMutation,
  FlowStatusMutationVars,
  GET_ARCHIVED_FLOWS,
  GET_FLOWS,
  UNARCHIVE_FLOW,
} from "../../queries";

export const useUnarchiveFlow = (id: string, slug: string, teamId: number) =>
  useMutation<FlowStatusMutation, FlowStatusMutationVars>(UNARCHIVE_FLOW, {
    variables: { id, slug },
    refetchQueries: [
    { query: GET_FLOWS, variables: { teamId } },
    { query: GET_ARCHIVED_FLOWS, variables: { teamId } },
  ],
  });