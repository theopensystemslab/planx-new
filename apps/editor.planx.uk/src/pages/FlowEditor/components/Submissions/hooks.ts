import { useQuery } from "@apollo/client";

import {
  GET_SUBMISSION_EVENTS,
  GET_SUBMISSIONS,
  GET_TEAM_LOGO,
} from "./queries";
import type {
  GetSubmissionEventsQuery,
  GetSubmissionEventsVariables,
  GetSubmissionsQuery,
  GetSubmissionsVariables,
  GetTeamLogoQuery,
  GetTeamLogoVariables,
} from "./types";

export const useGetSubmissions = (teamId: number) => {
  const query = useQuery<GetSubmissionsQuery, GetSubmissionsVariables>(
    GET_SUBMISSIONS,
    {
      variables: { teamId },
      skip: !teamId,
      pollInterval: 10_000,
    },
  );

  return query;
};

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
