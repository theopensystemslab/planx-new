import { useMutation } from "@apollo/client";

import type {
  FlowNotificationCascadeMutationResponse,
  FlowStatusMutationVars,
} from "../../queries";
import { ARCHIVE_FLOW, GET_ARCHIVED_FLOWS, GET_FLOWS } from "../../queries";

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
