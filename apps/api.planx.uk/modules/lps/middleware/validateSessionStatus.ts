import { gql } from "graphql-request";
import type { GenerateDownloadToken } from "../types/downloadToken.js";
import { $api } from "../../../client/index.js";

interface CheckDownloadableSessionExists {
  lowcalSessions: { id: string }[];
}

/**
 * Ensure that a valid session exist before generating a download token
 * A valid session is one where -
 *  - system_status = "active" (data exists for download)
 *  - user_status = "submitted" (we have a fully populated and validated passport to generate the HTML)
 */
export const validateSessionStatus: GenerateDownloadToken = async (
  _req,
  res,
  next,
) => {
  const { email, sessionId } = res.locals.parsedReq.body;

  const {
    lowcalSessions: [session],
  } = await $api.client.request<CheckDownloadableSessionExists>(
    gql`
      query CheckDownloadableSessionExists($sessionId: uuid!, $email: String!) {
        lowcalSessions: lowcal_sessions(
          where: {
            system_status: { _eq: "active" }
            # Maybe make this an argument? Needs to be toggled off for partial applications
            # user_status: { _eq: "submitted" }
            id: { _eq: $sessionId }
            email: { _eq: $email }
          }
        ) {
          id
        }
      }
    `,
    { sessionId, email },
  );

  if (session) return next();

  return res.status(403).send({ error: "Unauthorised" });
};
