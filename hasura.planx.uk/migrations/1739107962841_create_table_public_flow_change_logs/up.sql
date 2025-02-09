CREATE TABLE "public"."flow_change_logs" (
  "id" serial NOT NULL, 
  "flow_id" uuid NOT NULL, 
  "actor_id" integer NOT NULL, 
  "comment" text NOT NULL, 
  "created_at" Timestamp NOT NULL DEFAULT now(), 
  PRIMARY KEY ("id") , 
  UNIQUE ("id")
);
COMMENT ON TABLE "public"."flow_change_logs" IS E'Editor comment logs to summarise flow operations between publishes';
