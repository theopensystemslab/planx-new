import { useMutation } from "@apollo/client";

import {
  ARCHIVE_FLOW,
  FlowNotificationCascadeMutationResponse,
  FlowStatusMutationVars,
  GET_ARCHIVED_FLOWS,
  GET_FLOWS,
} from "../../queries";

export const useArchiveFlow = (id: string, slug: string, teamId: number) =>
  useMutation<FlowNotificationCascadeMutationResponse, FlowStatusMutationVars>(
    ARCHIVE_FLOW,
    {
      variables: { id, slug },
      refetchQueries: [
        { query: GET_FLOWS, variables: { teamId } },
        { query: GET_ARCHIVED_FLOWS, variables: { teamId } },
      ],
    },
  );
