import { useMutation } from "@apollo/client";

import {
  ARCHIVE_FLOW,
  FlowStatusMutation,
  FlowStatusMutationVars,
} from "../../queries";

export const useArchiveFlow = (id: string, slug: string) =>
  useMutation<FlowStatusMutation, FlowStatusMutationVars>(ARCHIVE_FLOW, {
    variables: { id, slug: `${slug}-archive` },
  });