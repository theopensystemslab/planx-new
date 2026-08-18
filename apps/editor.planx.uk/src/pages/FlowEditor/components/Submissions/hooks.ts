import { useQuery } from "@apollo/client";

import { GET_TEAM_LOGO } from "./queries";
import type { GetTeamLogoQuery, GetTeamLogoVariables } from "./types";

export const useTeamLogo = (teamSlug: string) => {
  const query = useQuery<GetTeamLogoQuery, GetTeamLogoVariables>(
    GET_TEAM_LOGO,
    {
      variables: { teamSlug },
    },
  );

  return query;
};

// useGetSubmissionHistory
