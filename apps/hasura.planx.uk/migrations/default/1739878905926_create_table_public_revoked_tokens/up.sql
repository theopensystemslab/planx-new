CREATE TABLE "public"."revoked_tokens" (
  "token_digest" text NOT NULL,
  "revoked_at" timestamptz NOT NULL DEFAULT now(),
  "expires_at" timestamptz NOT NULL,
  PRIMARY KEY ("token_digest")
);

COMMENT ON TABLE "public"."revoked_tokens" IS E'Holds a digest of revoked JWTs. This table is checked as part of the auth process. Token are revoked as part of the logout process to ensure that a user\'s token cannot be re-used.';

COMMENT ON COLUMN "public"."revoked_tokens"."token_digest" IS E'SHA-256 encoded digest of a user\'s JWT';
