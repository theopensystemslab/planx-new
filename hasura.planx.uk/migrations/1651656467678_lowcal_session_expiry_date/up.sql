CREATE OR REPLACE FUNCTION lowcal_session_expiry_date(lowcal_session_row lowcal_sessions)
RETURNS timestamp with time zone AS $$
  SELECT lowcal_session_row.created_at + INTERVAL '28 days'
$$ LANGUAGE sql STABLE;
