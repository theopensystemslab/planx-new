import { useMutation } from "@apollo/client";

import {
  DELETE_FLOW,
  FlowNotificationCascadeMutationResponse,
  FlowStatusMutationVars,
  GET_ARCHIVED_FLOWS,
} from "../../queries";

export const useDeleteFlow = (id: string, slug: string, teamId: number) =>
  useMutation<FlowNotificationCascadeMutationResponse, FlowStatusMutationVars>(
    DELETE_FLOW,
    {
      variables: { id, slug },
      refetchQueries: [{ query: GET_ARCHIVED_FLOWS, variables: { teamId } }],
    },
  );
