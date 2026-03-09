CREATE TABLE "public"."application_access_tokens" (
  "token" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "last_accessed_at" timestamptz,
  "access_count" integer NOT NULL DEFAULT 0,
  "expires_at" timestamptz NOT NULL,
  "revoked_at" timestamptz,
  "session_id" uuid NOT NULL,
  PRIMARY KEY ("token"),
  FOREIGN KEY ("session_id") REFERENCES "public"."lowcal_sessions"("id") ON UPDATE no action ON DELETE no action,
  UNIQUE ("session_id")
);

COMMENT ON TABLE "public"."application_access_tokens" IS E'Secure tokens which allow access to a specific application. Used by "send to email" integration to allow non-editors secure access to application data.';

CREATE EXTENSION IF NOT EXISTS pgcrypto;
