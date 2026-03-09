import { gql } from "graphql-request";
import { $api } from "../../../client/index.js";
import type { UseAccessTokenAuth } from "./types.js";

interface AccessToken {
  revokedAt: string;
  expiresAt: string;
  sessionId: string;
}

/**
 * Middleware to authenticate requests using a submission access token
 * Validates the token is present, unrevoked, and unexpired
 * On success, attaches the associated sessionId to res.locals
 */
export const useAccessTokenAuth: UseAccessTokenAuth = async (
  _req,
  res,
  next,
) => {
  const { authorization: token } = res.locals.parsedReq.headers;

  const record = await getTokenRecord(token);

  if (!record) {
    return res.status(404).json({ error: "INVALID_ACCESS_TOKEN" });
  }

  if (record.revokedAt) {
    return res.status(410).json({ error: "REVOKED_ACCESS_TOKEN" });
  }

  if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
    return res.status(410).json({ error: "EXPIRED_ACCESS_TOKEN" });
  }

  await useToken(token);

  res.locals.sessionId = record.sessionId;

  return next();
};

const getTokenRecord = async (token: string) => {
  const { record } = await $api.client.request<{
    record: AccessToken | null;
  }>(
    gql`
      query GetApplicationAccessToken($token: uuid!) {
        record: application_access_tokens_by_pk(token: $token) {
          expiresAt: expires_at
          revokedAt: revoked_at
          sessionId: session_id
        }
      }
    `,
    { token },
  );

  return record;
};

const useToken = async (token: string) => {
  await $api.client.request(
    gql`
      mutation UseAccessToken($token: uuid!) {
        update_application_access_tokens_by_pk(
          pk_columns: { token: $token }
          _inc: { access_count: 1 }
          _set: { last_accessed_at: "now()" }
        ) {
          last_accessed_at
          access_count
        }
      }
    `,
    { token },
  );
};
