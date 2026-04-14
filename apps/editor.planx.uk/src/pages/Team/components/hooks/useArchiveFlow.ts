import { useMutation } from "@apollo/client";

import {
  ARCHIVE_FLOW,
  ArchiveFlowQuery,
  ArchiveFlowQueryVars,
} from "../../queries";

export const useArchiveFlow = (id: string, slug: string) =>
  useMutation<ArchiveFlowQuery, ArchiveFlowQueryVars>(ARCHIVE_FLOW, {
    variables: { id, slug: `${slug}-archive` },
  });
