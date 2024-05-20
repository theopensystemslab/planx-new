-- Setup enum table of possible values for flow.status
CREATE TABLE "public"."flow_status_enum" (
  "value" text NOT NULL,
  "comment" text,
  PRIMARY KEY ("value")
);

COMMENT ON TABLE "public"."flow_status_enum" IS E'An enum for tracking the status of a flow';

INSERT INTO "public"."flow_status_enum"("value", "comment") VALUES (E'online', null);
INSERT INTO "public"."flow_status_enum"("value", "comment") VALUES (E'offline', null);

-- Add flow.status column
alter table "public"."flows" add column "status" text
 not null default 'online';

alter table "public"."flows"
  add constraint "flows_status_fkey"
  foreign key ("status")
  references "public"."flow_status_enum"
  ("value") on update restrict on delete restrict;

-- Create audit table to track changes to status
-- Could be used for analytics or other audit features in future
CREATE TABLE "public"."flow_status_history" (
  "id" serial NOT NULL,
  "flow_id" uuid NOT NULL,
  "status" text NOT NULL,
  "event_start" timestamptz NOT NULL,
  "event_end" timestamptz,
  PRIMARY KEY ("id"),
  FOREIGN KEY ("flow_id") REFERENCES "public"."flows"("id") ON UPDATE restrict ON DELETE cascade,
  FOREIGN KEY ("status") REFERENCES "public"."flow_status_enum"("value") ON UPDATE restrict ON DELETE restrict,
  UNIQUE ("id")
);

COMMENT ON TABLE "public"."flow_status_history" IS E'Temporal table to track the status of a flow over time';

-- Populate initial table values
-- All flows have had status "online" since they were created
INSERT INTO flow_status_history (flow_id, status, event_start)
SELECT id, 'online', created_at
FROM flows;

-- Setup function which updates and adds audit records to flow_status_history
CREATE OR REPLACE FUNCTION track_flow_status_history()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        -- End previous event
        UPDATE flow_status_history
        SET event_end = NOW()
        WHERE flow_id = OLD.id AND event_end IS NULL;

        -- Start new event
        INSERT INTO flow_status_history (flow_id, status, event_start)
        VALUES (NEW.id, OLD.status, NOW());

    ELSIF (TG_OP = 'INSERT') THEN
        -- Start new event
        INSERT INTO flow_status_history (flow_id, status, event_start)
        VALUES (NEW.id, NEW.status, NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call above function
-- Called on insert or update to flows.status
CREATE TRIGGER flow_status_history_trigger
AFTER INSERT OR UPDATE OF status ON flows
FOR EACH ROW
EXECUTE FUNCTION track_flow_status_history();

