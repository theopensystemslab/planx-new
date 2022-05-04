-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- CREATE FUNCTION lowcal_session_expiry_date(lowcal_session_row lowcal_sessions)
-- RETURNS timestamp with time zone AS $$
--   SELECT lowcal_session_row.updated_at + INTERVAL '28 days'
-- $$ LANGUAGE sql STABLE;

DROP FUNCTION IF EXISTS lowcal_session_expiry_date;