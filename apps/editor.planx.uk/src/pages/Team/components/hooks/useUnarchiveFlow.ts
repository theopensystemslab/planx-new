import { useMutation } from "@apollo/client";

import {
  UNARCHIVE_FLOW,
  UnarchiveFlowQuery,
  UnarchiveFlowQueryVars,
} from "../../queries";

export const useUnarchiveFlow = (id: string, slug: string) =>
  useMutation<UnarchiveFlowQuery, UnarchiveFlowQueryVars>(UNARCHIVE_FLOW, {
    variables: { id, slug },
  });
