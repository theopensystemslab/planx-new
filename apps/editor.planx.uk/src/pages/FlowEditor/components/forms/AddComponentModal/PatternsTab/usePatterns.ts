import { useQuery } from "@apollo/client";

import type { GetPatternsQuery } from "./queries";
import { GET_PATTERNS } from "./queries";

export const usePatterns = () => useQuery<GetPatternsQuery>(GET_PATTERNS);
