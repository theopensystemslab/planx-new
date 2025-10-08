import { createHash } from "crypto";
import { $admin, $api } from "../../../../client/index.js";
import { gql } from "graphql-request";
import { getJWTExpiration } from "../jwt.js";
import { ServerError } from "../../../../errors/serverError.js";
import type { IsRevokedQuery, RevokeTokenMutation } from "./types.js";

/**
 * Generate a digest of the JWT and add the revoked_tokens blocklist
 * Docs: https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html#no-built-in-token-revocation-by-the-user
 */
export const revokeToken = async (jwt: string): Promise<void> => {
  const tokenDigest = createTokenDigest(jwt);

  // Already revoked, no action needed
  const isRevoked = await isTokenRevoked(tokenDigest);
  if (isRevoked) return;

  const expiresAt = getJWTExpiration(jwt);
  await trackRevokedToken(tokenDigest, expiresAt);
};

export const createTokenDigest = (jwt: string) => {
  const tokenDigest = createHash("sha256").update(jwt).digest("hex");
  return tokenDigest;
};

export const isTokenRevoked = async (tokenDigest: string): Promise<boolean> => {
  try {
    const { revokedToken } = await $admin.client.request<IsRevokedQuery>(
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

    return Boolean(revokedToken?.revokedAt);
  } catch (error) {
    throw new ServerError({
      message: "Failed to check if token is already revoked",
    });
  }
};

const trackRevokedToken = async (
  tokenDigest: string,
  expiresAt: Date,
): Promise<boolean> => {
  try {
    const { insertRevokedTokensOne } =
      await $api.client.request<RevokeTokenMutation>(
        gql`
          mutation RevokeToken(
            $token_digest: String!
            $expires_at: timestamptz!
          ) {
            insertRevokedTokensOne: insert_revoked_tokens_one(
              object: {
                expires_at: $expires_at
                revoked_at: "now()"
                token_digest: $token_digest
              }
            ) {
              revokedAt: revoked_at
            }
          }
        `,
        {
          expires_at: expiresAt,
          token_digest: tokenDigest,
        },
      );

    return Boolean(insertRevokedTokensOne?.revokedAt);
  } catch (error) {
    throw new ServerError({
      message: "Failed to add token to revoked list",
    });
  }
};
