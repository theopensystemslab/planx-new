ALTER TABLE lowcal_sessions ADD COLUMN tracked_answers JSONB null;

CREATE OR REPLACE FUNCTION track_lowcal_sessions_answers_on_submit() RETURNS trigger AS $$
DECLARE
    tracked_answers JSONB;
BEGIN
    SELECT data -> 'passport' -> 'data' -> 'proposal.projectType' INTO tracked_answers FROM lowcal_sessions WHERE submitted_at IS NOT NULL;
    IF tracked_answers IS NOT NULL THEN
        INSERT INTO lowcal_sessions (tracked_answers) VALUES (NEW.data -> 'passport' -> 'data' -> 'proposal.projectType');
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_lowcal_sessions_answers_on_submit 
AFTER UPDATE OF submitted_at ON lowcal_sessions
FOR EACH ROW EXECUTE PROCEDURE track_lowcal_sessions_answers_on_submit();

COMMENT ON TRIGGER track_lowcal_sessions_answers_on_submit ON lowcal_sessions
IS 'When a lowcal session is submitted, parse the answers of any allow-listed questions from the passport into a separate un-sanitised column for analytics';
