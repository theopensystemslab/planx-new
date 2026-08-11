CREATE OR REPLACE VIEW "public"."submissions_grouped" AS WITH payments AS (
  SELECT
    ps.session_id,
    'Pay' :: text AS event_type,
    initcap(ps.status) AS status,
    ps.created_at
  FROM
    (
      payment_status ps
      LEFT JOIN payment_status_enum pse ON ((pse.value = ps.status))
    )
  WHERE
    (
      (ps.status <> 'created' :: text)
      AND (
        ps.created_at >= '2024-01-01 00:00:00+00' :: timestamp with time zone
      )
    )
),
invitations_to_pay AS (
  SELECT
    pr.session_id,
    'Invite to pay' :: text AS event_type,
    CASE
      WHEN pr.paid_at IS NULL THEN 'Invited to pay' :: text
      ELSE 'Paid' :: text
    END AS status,
    pr.created_at
  FROM
    payment_requests pr
),
submissions AS (
  SELECT
    (
      (
        (
          (seil.request -> 'payload' :: text) -> 'payload' :: text
        ) ->> 'sessionId' :: text
      )
    ) :: uuid AS session_id,
    CASE
      WHEN ((se.webhook_conf) :: text ~~ '%bops%' :: text) THEN 'Submit to BOPS' :: text
      WHEN ((se.webhook_conf) :: text ~~ '%uniform%' :: text) THEN 'Submit to Uniform' :: text
      WHEN (
        (se.webhook_conf) :: text ~~ '%email-submission%' :: text
      ) THEN 'Send to email' :: text
      WHEN (
        (se.webhook_conf) :: text ~~ '%?notify=false%' :: text
      ) THEN 'Upload to AWS S3 (no notification)' :: text
      WHEN (
        (se.webhook_conf) :: text ~~ '%upload-submission%' :: text
      ) THEN 'Upload to AWS S3' :: text
      WHEN ((se.webhook_conf) :: text ~~ '%idox%' :: text) THEN 'Submit to Idox Nexus' :: text
      ELSE (se.webhook_conf) :: text
    END AS event_type,
    CASE
      WHEN (seil.status = 200) THEN 'Success' :: text
      ELSE format('Failed (%s)' :: text, seil.status)
    END AS status,
    seil.created_at
  FROM
    (
      hdb_catalog.hdb_scheduled_events se
      LEFT JOIN hdb_catalog.hdb_scheduled_event_invocation_logs seil ON ((seil.event_id = se.id))
    )
  WHERE
    (
      (
        seil.created_at >= '2024-01-01 00:00:00+00' :: timestamp with time zone
      )
      AND (
        ((se.webhook_conf) :: text ~~ '%bops%' :: text)
        OR ((se.webhook_conf) :: text ~~ '%uniform%' :: text)
        OR (
          (se.webhook_conf) :: text ~~ '%email-submission%' :: text
        )
        OR (
          (se.webhook_conf) :: text ~~ '%?notify=false%' :: text
        )
        OR (
          (se.webhook_conf) :: text ~~ '%upload-submission%' :: text
        )
        OR ((se.webhook_conf) :: text ~~ '%idox%' :: text)
      )
    )
),
all_events AS (
  SELECT
    payments.session_id,
    payments.event_type,
    payments.status,
    payments.created_at
  FROM
    payments
  UNION ALL
  SELECT
    invitations_to_pay.session_id,
    invitations_to_pay.event_type,
    invitations_to_pay.status,
    invitations_to_pay.created_at
  FROM
    invitations_to_pay
  UNION ALL
  SELECT
    submissions.session_id,
    submissions.event_type,
    submissions.status,
    submissions.created_at
  FROM
    submissions
),
latest_per_event_type AS (
  SELECT DISTINCT ON (session_id, event_type)
    session_id,
    event_type,
    status,
    created_at
  FROM
    all_events
  ORDER BY
    session_id,
    event_type,
    created_at DESC
),
representative_event AS (
  SELECT DISTINCT ON (session_id)
    session_id,
    event_type,
    status,
    created_at
  FROM
    latest_per_event_type
  ORDER BY
    session_id,
    (status ~~ 'Failed%' :: text) DESC,
    created_at DESC
)
SELECT
  f.id AS flow_id,
  re.session_id,
  re.event_type,
  re.status,
  re.created_at,
  f.team_id,
  f.name AS flow_name,
  COALESCE(
    (
      (
        ((ls.data -> 'passport' :: text) -> 'data' :: text) -> '_address' :: text
      ) ->> 'single_line_address' :: text
    ),
    (
      (
        ((ls.data -> 'passport' :: text) -> 'data' :: text) -> '_address' :: text
      ) ->> 'title' :: text
    )
  ) AS address
FROM
  (
    (
      representative_event re
      LEFT JOIN lowcal_sessions ls ON ((ls.id = re.session_id))
    )
    LEFT JOIN flows f ON ((f.id = ls.flow_id))
  )
WHERE
  (ls.flow_id IS NOT NULL)
ORDER BY
  re.created_at DESC;