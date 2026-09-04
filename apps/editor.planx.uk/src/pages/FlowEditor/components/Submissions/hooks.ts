import { useQuery } from "@apollo/client";

import { GET_SUBMISSION_EVENTS, GET_TEAM_LOGO } from "./queries";
import type {
  GetSubmissionEventsQuery,
  GetSubmissionEventsVariables,
  GetTeamLogoQuery,
  GetTeamLogoVariables,
} from "./types";

export const useGetSubmissionEvents = (sessionId: string) => {
  const query = useQuery<
    GetSubmissionEventsQuery,
    GetSubmissionEventsVariables
  >(GET_SUBMISSION_EVENTS, {
    variables: { sessionId },
    skip: !sessionId,
  });

  return query;
};

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
