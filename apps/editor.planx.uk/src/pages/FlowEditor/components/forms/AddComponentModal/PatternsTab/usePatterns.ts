import { useQuery } from "@apollo/client";

import type {
  GetPatternDataQuery,
  GetPatternDataVars,
  GetPatternsQuery,
} from "./queries";
import { GET_PATTERN_DATA, GET_PATTERNS } from "./queries";

export const usePatterns = () => useQuery<GetPatternsQuery>(GET_PATTERNS);

export const usePatternData = (id: string | null) =>
  useQuery<GetPatternDataQuery, GetPatternDataVars>(GET_PATTERN_DATA, {
    variables: { id: id! },
    skip: !id,
  });
