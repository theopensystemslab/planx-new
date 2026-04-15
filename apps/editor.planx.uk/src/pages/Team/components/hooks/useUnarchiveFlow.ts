import { useMutation } from "@apollo/client";

import {
  FlowStatusMutation,
  FlowStatusMutationVars,
  UNARCHIVE_FLOW,
} from "../../queries";

export const useUnarchiveFlow = (id: string, slug: string) =>
  useMutation<FlowStatusMutation, FlowStatusMutationVars>(UNARCHIVE_FLOW, {
    variables: { id, slug },
  });