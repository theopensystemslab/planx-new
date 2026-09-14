-- Audit table to track changes to team_settings.is_trial
-- needed for the activity panel on explore page i.e. 'council X has joined PlanX'
-- table structure and trigger mirrors flow_status_history
CREATE TABLE "public"."team_trial_history" (
  "id" serial NOT NULL,
  "team_id" integer NOT NULL,
  "is_trial" boolean NOT NULL,
  "event_start" timestamptz NOT NULL,
  "event_end" timestamptz,
  PRIMARY KEY ("id"),
  FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON UPDATE restrict ON DELETE cascade,
  UNIQUE ("id")
);

COMMENT ON TABLE "public"."team_trial_history" IS E'Temporal table to track team_settings.is_trial over time';

-- Populate initial table values using existing is_trial value
INSERT INTO team_trial_history (team_id, is_trial, event_start)
SELECT ts.team_id, COALESCE(ts.is_trial, false), t.created_at
FROM team_settings ts
JOIN teams t ON t.id = ts.team_id;

-- Setup function which adds audit records to team_trial_history
CREATE OR REPLACE FUNCTION track_team_trial_history()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        -- an existing team's trial state is updated, change the existing entry and insert a new one
        UPDATE team_trial_history
        SET event_end = NOW()
        WHERE team_id = OLD.team_id AND event_end IS NULL;

        INSERT INTO team_trial_history (team_id, is_trial, event_start)
        VALUES (NEW.team_id, NEW.is_trial, NOW());

    ELSIF (TG_OP = 'INSERT') THEN
        -- a new team is created, set its trial state
        INSERT INTO team_trial_history (team_id, is_trial, event_start)
        VALUES (NEW.team_id, NEW.is_trial, NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Called on insert or update to team_settings.is_trial
CREATE TRIGGER team_trial_history_trigger
AFTER INSERT OR UPDATE OF is_trial ON team_settings
FOR EACH ROW
EXECUTE FUNCTION track_team_trial_history();
