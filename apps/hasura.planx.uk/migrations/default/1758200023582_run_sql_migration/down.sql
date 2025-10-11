--  Previous implementation from hasura.planx.uk/migrations/default/1756743433814_run_sql_migration/up.sql
CREATE OR REPLACE FUNCTION public.lowcal_sessions_user_status(
  lowcal_session_row lowcal_sessions
) RETURNS TEXT AS
$$
SELECT
  CASE
    WHEN lowcal_session_row.submitted_at IS NOT NULL THEN 'submitted'
    WHEN lowcal_session_row.locked_at IS NOT NULL THEN 'awaiting-payment'
    WHEN lowcal_session_row.deleted_at IS NOT NULL THEN 'expired'
  ELSE 'draft'
END;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.lowcal_sessions_system_status(
  lowcal_session_row lowcal_sessions
) RETURNS TEXT AS
$$
SELECT
  CASE
    WHEN lowcal_session_row.sanitised_at IS NULL 
      THEN 'active' 
      ELSE 'sanitised'
  END;
$$ LANGUAGE sql STABLE;