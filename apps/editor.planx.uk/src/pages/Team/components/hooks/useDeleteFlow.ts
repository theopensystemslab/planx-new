import { useMutation } from "@apollo/client";

import {
  DELETE_FLOW,
  FlowMutationResponse,
  FlowStatusMutationVars,
  GET_ARCHIVED_FLOWS,
} from "../../queries";

export const useDeleteFlow = (id: string, slug: string, teamId: number) =>
  useMutation<FlowMutationResponse, FlowStatusMutationVars>(DELETE_FLOW, {
    variables: { id, slug },
    refetchQueries: [{ query: GET_ARCHIVED_FLOWS, variables: { teamId } }],
  });
