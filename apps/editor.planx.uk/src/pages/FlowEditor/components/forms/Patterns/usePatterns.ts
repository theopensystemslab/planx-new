import { useQuery } from "@apollo/client";

import { GET_PATTERNS, type GetPatternsData } from "./queries";

export const usePatterns = () => useQuery<GetPatternsData>(GET_PATTERNS);
