import { gql } from "graphql-request";
import type { GenerateDownloadToken } from "../types/downloadToken.js";
import { $public } from "../../../client/index.js";

interface CheckDownloadableSessionExists {
  lowcalSessions: { id: string }[];
}

/**
 * Ensure that a valid session exist before generating a download token
 * A valid session is one where -
 *  - system_status = "active" (data exists for download)
 *  - user_stats = "submitted" (we have a fully populated and validated passport to generate the HTML)
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
  } = await $public.client.request<CheckDownloadableSessionExists>(
    gql`
      query CheckDownloadableSessionExists {
        lowcalSessions: lowcal_sessions(
          where: {
            system_status: { _eq: "active" }
            user_stats: { _eq: "submitted" }
          }
        ) {
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
