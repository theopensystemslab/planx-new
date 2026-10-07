import { gql } from "graphql-request";

import { $public } from "../../../../client/index.js";
import { getSaveAndReturnPublicHeaders } from "../../../saveAndReturn/service/utils.js";

interface FindSessionForInvite {
  sessions: { id: string }[];
}

export const isSessionOwnedByApplicant = async ({
  sessionId,
  email,
}: {
  sessionId: string;
  email: string;
}): Promise<boolean> => {
  const { sessions } = await $public.client.request<FindSessionForInvite>(
    gql`
      query FindSessionForInvite($sessionId: uuid!) {
        sessions: lowcal_sessions(where: { id: { _eq: $sessionId } }) {
          id
        }
      }
    `,
    { sessionId },
    getSaveAndReturnPublicHeaders(sessionId, email),
  );

  return sessions.length > 0;
};
