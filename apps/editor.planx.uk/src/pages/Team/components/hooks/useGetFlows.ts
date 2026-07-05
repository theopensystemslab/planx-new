import { useQuery } from "@apollo/client";

import type { GetAnyFlowsQuery, GetAnyFlowsVars } from "../../queries";
import { GET_FLOWS } from "../../queries";

export const useGetFlows = (teamId: number) =>
  useQuery<GetAnyFlowsQuery, GetAnyFlowsVars>(GET_FLOWS, {
    variables: { teamId },
    fetchPolicy: "cache-and-network",
  });
