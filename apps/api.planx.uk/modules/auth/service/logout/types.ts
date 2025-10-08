interface RevokedToken {
  revokedAt: string;
  expiresAt: string;
  tokenDigest: string;
}

export interface IsRevokedQuery {
  revokedToken: RevokedToken | null;
}

export interface RevokeTokenMutation {
  insertRevokedTokensOne: Pick<RevokedToken, "revokedAt"> | null;
}
