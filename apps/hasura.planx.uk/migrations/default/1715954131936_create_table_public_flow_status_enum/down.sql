DROP TRIGGER IF EXISTS flow_status_history_trigger on flows;
DROP FUNCTION IF EXISTS track_flow_status_history();

DROP TABLE "public"."flow_status_history";

alter table
  "public"."flows" drop constraint "flows_status_fkey";

ALTER TABLE flows DROP COLUMN "status";

DROP TABLE "public"."flow_status_enum";