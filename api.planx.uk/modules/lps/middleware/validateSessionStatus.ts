import { gql } from "graphql-request";
import type { GenerateDownloadToken } from "../types/downloadToken.js";
import { $public } from "../../../client/index.js";

interface CheckSessionExists {
  lowcalSessions: { id: string }[];
}

/**
 * Ensure that a session exist before generating a download token
 */
export const validateSessionStatus: GenerateDownloadToken = async (
  _req,
  res,
  next,
) => {
  const { email, sessionId } = res.locals.parsedReq.body;

  // Querying via the public client and headers will return a unique result if one exists
  const publicHeaders = {
    "x-hasura-lowcal-session-id": sessionId,
    "x-hasura-lowcal-email": email,
  };

  const {
    lowcalSessions: [session],
  } = await $public.client.request<CheckSessionExists>(
    gql`
      query CheckSessionExists {
        lowcalSessions: lowcal_sessions {
          id
        }
      }
    `,
    {},
    publicHeaders,
  );

  if (session) return next();

  return res.status(403).send({ error: "Unauthorised" });
};
