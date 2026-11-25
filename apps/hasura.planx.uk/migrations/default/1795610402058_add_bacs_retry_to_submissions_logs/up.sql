-- Adds payment_method and pay_by to both submissions log views
--
-- pay_by is only set on a failed Bacs Direct Debit which can still be paid again
--  - Self-pay: 28 days from when the first delayed payment started (the session is unlocked)
--  - Invite to pay: 28 days from when the payment request was created (until it expires)
-- 28 days matches DAYS_UNTIL_EXPIRY in api.planx.uk and editor.planx.uk

CREATE OR REPLACE VIEW "public"."submission_services_log" AS
WITH payments AS (
  SELECT
    ps.session_id,
    COALESCE(ps.payment_id, ps.stripe_payment_id) AS event_id,
    'Pay'::TEXT AS event_type,
    INITCAP(COALESCE(ps.status, ps.stripe_status)) AS status,
    CASE
      WHEN ps.payment_id IS NOT NULL THEN JSONB_BUILD_OBJECT('status', ps.status, 'description', pse.comment, 'govuk_pay_reference', ps.payment_id, 'govuk_pay_metadata', ps.gov_pay_metadata)
      WHEN ps.stripe_payment_id IS NOT NULL THEN JSONB_BUILD_OBJECT('status', ps.stripe_status, 'description', spse.comment, 'stripe_reference', ps.stripe_payment_id, 'stripe_metadata', ps.stripe_metadata)
      ELSE NULL::JSONB
    END AS response,
    ps.created_at,
    FALSE AS retry,
    ps.payment_method,
    CASE
      WHEN ps.stripe_status IS DISTINCT FROM 'payment_failed' OR ps.payment_method IS DISTINCT FROM 'bacs_debit' THEN NULL
      WHEN ls.submitted_at IS NOT NULL OR ls.deleted_at IS NOT NULL THEN NULL
      WHEN pr.id IS NOT NULL AND pr.paid_at IS NOT NULL THEN NULL
      WHEN pr.id IS NOT NULL THEN pr.created_at + INTERVAL '28 days'
      ELSE COALESCE(ls.delayed_payment_started_at, ls.created_at) + INTERVAL '28 days'
    END AS pay_by
  FROM payment_status ps
    LEFT JOIN payment_status_enum pse ON pse.value = ps.status
    LEFT JOIN stripe_payment_status_enum spse ON spse.value = ps.stripe_status
    LEFT JOIN lowcal_sessions ls ON ls.id = ps.session_id
    LEFT JOIN payment_requests pr ON pr.id::TEXT = ps.stripe_metadata ->> 'paymentRequestId'
  WHERE ps.status::TEXT IS DISTINCT FROM 'created'
    AND ps.stripe_status::TEXT IS DISTINCT FROM 'created'
    AND ps.created_at >= '2024-01-01 00:00:00+00'::TIMESTAMPTZ
), retries AS (
  SELECT hdb_scheduled_event_invocation_logs.id
  FROM hdb_catalog.hdb_scheduled_event_invocation_logs
  WHERE (hdb_scheduled_event_invocation_logs.event_id, hdb_scheduled_event_invocation_logs.created_at) IN (
    SELECT seil.event_id, MAX(seil.created_at) AS max
    FROM hdb_catalog.hdb_scheduled_event_invocation_logs seil
      LEFT JOIN hdb_catalog.hdb_scheduled_events se ON se.id = seil.event_id
    WHERE se.tries > 1
    GROUP BY seil.event_id
  )
), submissions AS (
  SELECT
    (((seil.request -> 'payload') -> 'payload') ->> 'sessionId')::UUID AS session_id,
    se.id AS event_id,
    CASE
      WHEN se.webhook_conf::TEXT LIKE '%bops%' THEN 'Submit to BOPS'::TEXT
      WHEN se.webhook_conf::TEXT LIKE '%uniform%' THEN 'Submit to Uniform'::TEXT
      WHEN se.webhook_conf::TEXT LIKE '%email-submission%' THEN 'Send to email'::TEXT
      WHEN se.webhook_conf::TEXT LIKE '%?notify=false%' THEN 'Upload to AWS S3 (no notification)'::TEXT
      WHEN se.webhook_conf::TEXT LIKE '%upload-submission%' THEN 'Upload to AWS S3'::TEXT
      WHEN se.webhook_conf::TEXT LIKE '%idox%' THEN 'Submit to Idox Nexus'::TEXT
      ELSE se.webhook_conf::TEXT
    END AS event_type,
    CASE
      WHEN seil.status = 200 THEN 'Success'::TEXT
      ELSE FORMAT('Failed (%s)'::TEXT, seil.status)
    END AS status,
    seil.response::JSONB AS response,
    seil.created_at,
    (EXISTS (SELECT 1 FROM retries r WHERE r.id = seil.id)) AS retry,
    NULL::TEXT AS payment_method,
    NULL::TIMESTAMPTZ AS pay_by
  FROM hdb_catalog.hdb_scheduled_events se
    LEFT JOIN hdb_catalog.hdb_scheduled_event_invocation_logs seil ON seil.event_id = se.id
  WHERE seil.created_at >= '2024-01-01 00:00:00+00'::TIMESTAMPTZ
    AND (
      se.webhook_conf::TEXT LIKE '%bops%'
      OR se.webhook_conf::TEXT LIKE '%uniform%'
      OR se.webhook_conf::TEXT LIKE '%email-submission%'
      OR se.webhook_conf::TEXT LIKE '%?notify=false%'
      OR se.webhook_conf::TEXT LIKE '%upload-submission%'
      OR se.webhook_conf::TEXT LIKE '%idox%'
    )
), session_starts AS (
  SELECT
    ls_1.id AS session_id,
    ls_1.id::TEXT AS event_id,
    'Started session'::TEXT AS event_type,
    'Success'::TEXT AS status,
    NULL::JSONB AS response,
    ls_1.created_at,
    FALSE AS retry,
    NULL::TEXT AS payment_method,
    NULL::TIMESTAMPTZ AS pay_by
  FROM lowcal_sessions ls_1
  WHERE ls_1.created_at >= '2024-01-01 00:00:00+00'::TIMESTAMPTZ
    AND ls_1.created_at IS NOT NULL
), payment_invites AS (
  SELECT
    pr.session_id,
    pr.id::TEXT AS event_id,
    'Invited to pay'::TEXT AS event_type,
    'Success'::TEXT AS status,
    JSONB_BUILD_OBJECT('payee_email', pr.payee_email, 'payee_name', pr.payee_name, 'paid_at', pr.paid_at) AS response,
    pr.created_at,
    FALSE AS retry,
    NULL::TEXT AS payment_method,
    NULL::TIMESTAMPTZ AS pay_by
  FROM payment_requests pr
  WHERE pr.created_at >= '2024-01-01 00:00:00+00'::TIMESTAMPTZ
), all_events AS (
  SELECT * FROM payments
  UNION ALL
  SELECT * FROM submissions
  UNION ALL
  SELECT * FROM session_starts
  UNION ALL
  SELECT * FROM payment_invites
)
SELECT
  ls.flow_id,
  ae.session_id,
  ae.event_id,
  ae.event_type,
  ae.status,
  ae.response,
  ae.created_at,
  ae.retry,
  f.team_id,
  f.name AS flow_name,
  CASE
    WHEN ls.submitted_at < (NOW() - '6 mons'::INTERVAL) THEN 'No longer retained'::TEXT
    ELSE COALESCE(
      (((ls.data -> 'passport') -> 'data') -> '_address') ->> 'single_line_address',
      (((ls.data -> 'passport') -> 'data') -> '_address') ->> 'title',
      'Not applicable'::TEXT
    )
  END AS address,
  ae.payment_method,
  ae.pay_by
FROM all_events ae
  LEFT JOIN lowcal_sessions ls ON ls.id = ae.session_id
  LEFT JOIN flows f ON f.id = ls.flow_id
WHERE ls.flow_id IS NOT NULL
ORDER BY ae.created_at DESC;

CREATE OR REPLACE VIEW "public"."submissions_grouped" AS
WITH payments AS (
  SELECT
    ps.session_id,
    'Pay'::TEXT AS event_type,
    INITCAP(COALESCE(ps.status, ps.stripe_status)) AS status,
    ps.created_at,
    ps.payment_method,
    CASE
      WHEN ps.stripe_status IS DISTINCT FROM 'payment_failed' OR ps.payment_method IS DISTINCT FROM 'bacs_debit' THEN NULL
      WHEN ls.submitted_at IS NOT NULL OR ls.deleted_at IS NOT NULL THEN NULL
      WHEN pr.id IS NOT NULL AND pr.paid_at IS NOT NULL THEN NULL
      WHEN pr.id IS NOT NULL THEN pr.created_at + INTERVAL '28 days'
      ELSE COALESCE(ls.delayed_payment_started_at, ls.created_at) + INTERVAL '28 days'
    END AS pay_by
  FROM payment_status ps
    LEFT JOIN lowcal_sessions ls ON ls.id = ps.session_id
    LEFT JOIN payment_requests pr ON pr.id::TEXT = ps.stripe_metadata ->> 'paymentRequestId'
  WHERE ps.status::TEXT IS DISTINCT FROM 'created'
    AND ps.stripe_status::TEXT IS DISTINCT FROM 'created'
    AND ps.created_at >= '2024-01-01 00:00:00+00'::TIMESTAMPTZ
), invitations_to_pay AS (
  SELECT
    pr.session_id,
    'Invited to pay'::TEXT AS event_type,
    'Success'::TEXT AS status,
    pr.created_at,
    NULL::TEXT AS payment_method,
    NULL::TIMESTAMPTZ AS pay_by
  FROM payment_requests pr
), submissions AS (
  SELECT
    (((seil.request -> 'payload') -> 'payload') ->> 'sessionId')::UUID AS session_id,
    CASE
      WHEN se.webhook_conf::TEXT LIKE '%bops%' THEN 'Submit to BOPS'::TEXT
      WHEN se.webhook_conf::TEXT LIKE '%uniform%' THEN 'Submit to Uniform'::TEXT
      WHEN se.webhook_conf::TEXT LIKE '%email-submission%' THEN 'Send to email'::TEXT
      WHEN se.webhook_conf::TEXT LIKE '%?notify=false%' THEN 'Upload to AWS S3 (no notification)'::TEXT
      WHEN se.webhook_conf::TEXT LIKE '%upload-submission%' THEN 'Upload to AWS S3'::TEXT
      WHEN se.webhook_conf::TEXT LIKE '%idox%' THEN 'Submit to Idox Nexus'::TEXT
      ELSE se.webhook_conf::TEXT
    END AS event_type,
    CASE
      WHEN seil.status = 200 THEN 'Success'::TEXT
      ELSE FORMAT('Failed (%s)'::TEXT, seil.status)
    END AS status,
    seil.created_at,
    NULL::TEXT AS payment_method,
    NULL::TIMESTAMPTZ AS pay_by
  FROM hdb_catalog.hdb_scheduled_events se
    LEFT JOIN hdb_catalog.hdb_scheduled_event_invocation_logs seil ON seil.event_id = se.id
  WHERE seil.created_at >= '2024-01-01 00:00:00+00'::TIMESTAMPTZ
    AND (
      se.webhook_conf::TEXT LIKE '%bops%'
      OR se.webhook_conf::TEXT LIKE '%uniform%'
      OR se.webhook_conf::TEXT LIKE '%email-submission%'
      OR se.webhook_conf::TEXT LIKE '%?notify=false%'
      OR se.webhook_conf::TEXT LIKE '%upload-submission%'
      OR se.webhook_conf::TEXT LIKE '%idox%'
    )
), all_events AS (
  SELECT * FROM payments
  UNION ALL
  SELECT * FROM invitations_to_pay
  UNION ALL
  SELECT * FROM submissions
), latest_per_event_type AS (
  SELECT DISTINCT ON (all_events.session_id, all_events.event_type) *
  FROM all_events
  ORDER BY all_events.session_id, all_events.event_type, all_events.created_at DESC
), representative_event AS (
  SELECT DISTINCT ON (latest_per_event_type.session_id) *
  FROM latest_per_event_type
  ORDER BY latest_per_event_type.session_id, (latest_per_event_type.status LIKE 'Failed%') DESC, latest_per_event_type.created_at DESC
)
SELECT
  f.id AS flow_id,
  re.session_id,
  re.event_type,
  re.status,
  re.created_at,
  f.team_id,
  f.name AS flow_name,
  CASE
    WHEN ls.submitted_at < (NOW() - '6 mons'::INTERVAL) THEN 'No longer retained'::TEXT
    ELSE COALESCE(
      (((ls.data -> 'passport') -> 'data') -> '_address') ->> 'single_line_address',
      (((ls.data -> 'passport') -> 'data') -> '_address') ->> 'title',
      'Not applicable'::TEXT
    )
  END AS address,
  re.payment_method,
  re.pay_by
FROM representative_event re
  LEFT JOIN lowcal_sessions ls ON ls.id = re.session_id
  LEFT JOIN flows f ON f.id = ls.flow_id
WHERE ls.flow_id IS NOT NULL
ORDER BY re.created_at DESC;
