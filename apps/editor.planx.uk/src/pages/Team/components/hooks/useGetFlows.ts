import { useQuery } from "@apollo/client";

import {
  GET_FLOWS,
  GetAnyFlowsQuery,
  GetAnyFlowsVars,
} from "../../queries";

export const useGetFlows = (teamId: number) =>
  useQuery<GetAnyFlowsQuery, GetAnyFlowsVars>(GET_FLOWS, {
    variables: { teamId },
    fetchPolicy: "cache-and-network",
  });
