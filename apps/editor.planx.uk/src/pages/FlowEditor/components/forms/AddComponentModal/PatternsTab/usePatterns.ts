import { useLazyQuery, useQuery } from "@apollo/client";

import type {
  GetPatternDataQuery,
  GetPatternDataVars,
  GetPatternsQuery,
} from "./queries";
import { GET_PATTERN_DATA, GET_PATTERNS } from "./queries";

export const usePatterns = () => useQuery<GetPatternsQuery>(GET_PATTERNS);

export const useFetchPatternGraph = () => {
  const [fetchPattern] = useLazyQuery<GetPatternDataQuery, GetPatternDataVars>(
    GET_PATTERN_DATA,
  );

  return async (id: string) => {
    const { data } = await fetchPattern({ variables: { id } }).catch(() => ({
      data: undefined,
    }));

    return data?.pattern?.data ?? null;
  };
};
