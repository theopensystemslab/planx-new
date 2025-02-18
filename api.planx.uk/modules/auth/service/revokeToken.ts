import { createHash } from "crypto";
import { $api } from "../../../client/index.js";
import { gql } from "graphql-request";
import { getJWTExpiration } from "./jwt.js";

export const revokeToken = async (jwt: string) => {
  const tokenDigest = createTokenDigest(jwt);

  // Already revoked, no action needed
  const isRevoked = await isTokenRevoked(tokenDigest);
  if (isRevoked) return;

  const expiresAt = getJWTExpiration(jwt);
  await trackRevokedToken(tokenDigest, expiresAt);
};

interface RevokedToken {
  revokedAt: string;
  expiresAt: string;
  tokenDigest: string;
}

interface IsRevokedQuery {
  revokedToken: RevokedToken | null;
}

const isTokenRevoked = async (tokenDigest: string) => {
  const { revokedToken } = await $api.client.request<IsRevokedQuery>(
    gql`
      query IsTokenRevoked($token_digest: String!) {
        revokedToken: revoked_tokens_by_pk(token_digest: $token_digest) {
          revokedAt: revoked_at
        }
      }
    `,
    {
      token_digest: tokenDigest,
    },
  );

  return revokedToken;
};

const createTokenDigest = (jwt: string) => {
  const cipheredToken = Buffer.from(jwt, "hex");
  const tokenDigest = createHash("sha256").update(cipheredToken).digest("hex");

  return tokenDigest;
};

const trackRevokedToken = async (tokenDigest: string, expiresAt: Date) => {
  await $api.client.request(
    gql`
      mutation RevokeToken($token_digest: String!, $expires_at: timestamptz!) {
        insert_revoked_tokens_one(
          object: {
            expires_at: $expires_at
            revoked_at: "now()"
            token_digest: $token_digest
          }
        ) {
          revoked_at
        }
      }
    `,
    {
      expires_at: expiresAt,
      token_digest: tokenDigest,
    },
  );
};
