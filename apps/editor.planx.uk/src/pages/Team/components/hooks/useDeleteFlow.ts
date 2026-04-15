import { useMutation } from "@apollo/client";

import {
  ArchiveFlowQuery,
  ArchiveFlowQueryVars,
  DELETE_FLOW,
  GET_ARCHIVED_FLOWS,
} from "../../queries";

export const useDeleteFlow = (id: string, slug: string, teamId: number) =>
  useMutation<ArchiveFlowQuery, ArchiveFlowQueryVars>(DELETE_FLOW, {
    variables: { id, slug },
    refetchQueries: [
      { query: GET_ARCHIVED_FLOWS, variables: { teamId } },
    ],
  });


