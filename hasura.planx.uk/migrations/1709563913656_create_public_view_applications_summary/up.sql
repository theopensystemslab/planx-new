CREATE OR REPLACE VIEW "public"."applications_summary" AS
SELECT
  s.session_id,
  s.team_slug,
  s.service_slug,
  submitted_at,
  user_invited_to_pay,
  COALESCE(ps.status, 'N/A') AS payment_status,
  COALESCE(ps.amount, 0) AS amount,
  COALESCE(ps.created_at::text, 'N/A') as  payment_date,
  sent_to_bops,
  sent_to_uniform,
  sent_to_email
FROM submission_services_summary s
LEFT JOIN (
  SELECT DISTINCT ON (session_id) *
  FROM payment_status
  ORDER BY session_id, created_at DESC
) ps ON ps.session_id = s.session_id
WHERE submitted_at IS NOT NULL;