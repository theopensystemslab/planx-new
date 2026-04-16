import { useQuery } from "@apollo/client";

import {
  GET_FLOWS,
  GetAnyFlowsQuery,
  GetAnyFlowsVars,
} from "../../queries";

export const useGetFlows = (teamId: number, userId: number) =>
  useQuery<GetAnyFlowsQuery, GetAnyFlowsVars>(GET_FLOWS, {
    variables: { teamId, userId },
    fetchPolicy: "cache-and-network",
  });