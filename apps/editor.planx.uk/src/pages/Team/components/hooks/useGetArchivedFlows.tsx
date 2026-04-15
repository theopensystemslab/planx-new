import { useQuery } from "@apollo/client";

import {
  GET_ARCHIVED_FLOWS,
  GetArchivedFlowsQuery,
  GetArchivedFlowsVars,
} from "../../queries";

export const useGetArchivedFlows = (teamId: number) =>
  useQuery<GetArchivedFlowsQuery, GetArchivedFlowsVars>(GET_ARCHIVED_FLOWS, {
    variables: { teamId },
    fetchPolicy: "cache-and-network",
  });
