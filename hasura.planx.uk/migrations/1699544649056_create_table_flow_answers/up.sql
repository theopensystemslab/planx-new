CREATE TABLE "public"."flow_answers"(
  "id" bigserial NOT NULL,
  "answers" jsonb NOT NULL DEFAULT jsonb_build_object(), 
  "created_at" timestamptz NOT NULL DEFAULT now(), 
  "flow_id" uuid NOT NULL,
  PRIMARY KEY ("id"), 
  CONSTRAINT "flow_answer_flows_id_fkey"
    FOREIGN KEY ("flow_id") 
    REFERENCES "public"."flows"("id") 
    ON UPDATE cascade 
    ON DELETE set null
);