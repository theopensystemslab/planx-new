-- CREATE OR REPLACE can't drop a column, so recreate the view
DROP VIEW "public"."stripe_daily_remittance";

CREATE VIEW "public"."stripe_daily_remittance" AS
SELECT
  t.slug AS team_slug,
  f.slug AS flow_slug,
  ps.session_id,
  ps.stripe_payment_id AS payment_id,
  ps.stripe_event_id AS event_id,
  ps.amount AS amount_in_pence,
  ps.fee_breakdown,
  ps.payment_method,
  ps.stripe_metadata AS metadata,
  ps.created_at AS paid_at
FROM payment_status ps
  JOIN flows f ON ps.flow_id = f.id
  JOIN teams t ON f.team_id = t.id
WHERE ps.stripe_payment_id IS NOT NULL
  AND ps.stripe_status = 'succeeded'
  AND ps.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY t.slug ASC, f.slug ASC, ps.created_at DESC;
