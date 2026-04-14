import { useMutation } from "@apollo/client";

import {
  ARCHIVE_FLOW,
  ArchiveFlowQuery,
  ArchiveFlowQueryVars,
  GET_ARCHIVED_FLOWS,
  GET_FLOWS,
} from "../../queries";

export const useArchiveFlow = (id: string, slug: string, teamId: number) =>
  useMutation<ArchiveFlowQuery, ArchiveFlowQueryVars>(ARCHIVE_FLOW, {
    variables: { id, slug: `${slug}-archive` },
    refetchQueries: [
      { query: GET_FLOWS, variables: { teamId } },
      { query: GET_ARCHIVED_FLOWS, variables: { teamId } },
    ],
  });
