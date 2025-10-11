CREATE TABLE "public"."analytics"(
  "id" bigserial NOT NULL, 
  "type" text NOT NULL, 
  "created_at" timestamptz NOT NULL DEFAULT now(), 
  "ended_at" timestamptz NULL,
  "flow_id" uuid NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "analytics_flow_id_fkey"
    FOREIGN KEY ("flow_id") 
    REFERENCES "public"."flows"("id") 
    ON UPDATE restrict 
    ON DELETE restrict
);

CREATE TABLE "public"."analytics_logs"(
  "id" bigserial NOT NULL,
  "flow_direction" text NOT NULL DEFAULT 'forwards', 
  "metadata" jsonb NOT NULL DEFAULT jsonb_build_object(), 
  "created_at" timestamptz NOT NULL DEFAULT now(), 
  "analytics_id" integer NOT NULL, 
  "user_exit" boolean NOT NULL DEFAULT false,
  "node_type" integer NOT NULL,
  "node_title" text,
  "has_clicked_help" boolean NOT NULL DEFAULT false,
  PRIMARY KEY ("id"), 
  CONSTRAINT "analytics_log_analytics_id_fkey"
    FOREIGN KEY ("analytics_id") 
    REFERENCES "public"."analytics"("id") 
    ON UPDATE cascade 
    ON DELETE set null
);
