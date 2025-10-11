CREATE OR REPLACE FUNCTION public.sessions_payment(
  session_row sessions
) RETURNS TEXT AS
$$
SELECT payment_id FROM payment_status
  WHERE session_id = session_row.id AND status = 'success'
  ORDER BY created_at DESC LIMIT 1
$$ LANGUAGE sql STABLE;
