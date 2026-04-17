import { useQuery } from "@apollo/client";

import {
  GET_ARCHIVED_FLOWS,
  GetAnyFlowsQuery,
  GetAnyFlowsVars,
} from "../../queries";

export const useGetArchivedFlows = (teamId: number) =>
  useQuery<GetAnyFlowsQuery, GetAnyFlowsVars>(GET_ARCHIVED_FLOWS, {
    variables: { teamId },
    fetchPolicy: "cache-and-network",
  });
