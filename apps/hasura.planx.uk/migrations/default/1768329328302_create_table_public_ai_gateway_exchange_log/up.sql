CREATE TABLE "public"."ai_gateway_audit_log"(
  "id" bigserial NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "planx_api_endpoint" text NOT NULL,
  "model_id" text NOT NULL,
  "prompt" text NOT NULL,
  "response" text,
  "gateway_status" text,
  "guardrail_tripped" boolean NOT NULL DEFAULT FALSE,
  "guardrail_reason" text,
  "guardrail_message" text,
  "token_usage" integer,
  "cost_usd" float8,
  "vercel_generation_id" text,
  "response_time_ms" integer,
  "session_id" uuid,
  "flow_id" uuid,
  PRIMARY KEY ("id"),
  UNIQUE ("vercel_generation_id")
);

COMMENT ON TABLE "public"."ai_gateway_audit_log" IS E'Audit log for request-response exchanges between the PlanX API and external AI models';

CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updated_at"()
  RETURNS TRIGGER
  AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER "set_public_ai_gateway_audit_log_updated_at"
  BEFORE UPDATE ON "public"."ai_gateway_audit_log"
  FOR EACH ROW
  EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();

COMMENT ON TRIGGER "set_public_ai_gateway_audit_log_updated_at" ON "public"."ai_gateway_audit_log" IS 'trigger to set value of column "updated_at" to current timestamp on row update';

