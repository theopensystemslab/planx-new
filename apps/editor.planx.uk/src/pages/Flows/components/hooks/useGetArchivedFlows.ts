import { useQuery } from "@apollo/client";

import type { GetAnyFlowsQuery, GetAnyFlowsVars } from "../../queries";
import { GET_ARCHIVED_FLOWS } from "../../queries";

export const useGetArchivedFlows = (teamId: number, skip?: boolean) =>
  useQuery<GetAnyFlowsQuery, GetAnyFlowsVars>(GET_ARCHIVED_FLOWS, {
    variables: { teamId },
    fetchPolicy: "cache-and-network",
    skip,
  });
