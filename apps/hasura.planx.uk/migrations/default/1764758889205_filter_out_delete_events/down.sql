-- Previous iteration from apps/hasura.planx.uk/migrations/default/1739375815458_run_sql_migration/up.sql
CREATE OR REPLACE VIEW "public"."submission_services_log" AS 
 WITH payments AS (
         SELECT ps.session_id,
            ps.payment_id AS event_id,
            'Pay'::text AS event_type,
            initcap(ps.status) AS status,
            jsonb_build_object('status', ps.status, 'description', pse.comment, 'govuk_pay_reference', ps.payment_id) AS response,
            ps.created_at,
            false AS retry
           FROM (payment_status ps
             LEFT JOIN payment_status_enum pse ON ((pse.value = ps.status)))
          WHERE ((ps.status <> 'created'::text) AND (ps.created_at >= '2024-01-01 00:00:00+00'::timestamp with time zone))
        ), retries AS (
         SELECT hdb_scheduled_event_invocation_logs.id
           FROM hdb_catalog.hdb_scheduled_event_invocation_logs
          WHERE ((hdb_scheduled_event_invocation_logs.event_id, hdb_scheduled_event_invocation_logs.created_at) IN ( SELECT seil.event_id,
                    max(seil.created_at) AS max
                   FROM (hdb_catalog.hdb_scheduled_event_invocation_logs seil
                     LEFT JOIN hdb_catalog.hdb_scheduled_events se ON ((se.id = seil.event_id)))
                  WHERE (se.tries > 1)
                  GROUP BY seil.event_id))
        ), submissions AS (
         SELECT ((((seil.request -> 'payload'::text) -> 'payload'::text) ->> 'sessionId'::text))::uuid AS session_id,
            se.id AS event_id,
                CASE
                    WHEN ((se.webhook_conf)::text ~~ '%bops%'::text) THEN 'Submit to BOPS'::text
                    WHEN ((se.webhook_conf)::text ~~ '%uniform%'::text) THEN 'Submit to Uniform'::text
                    WHEN ((se.webhook_conf)::text ~~ '%email-submission%'::text) THEN 'Send to email'::text
                    WHEN ((se.webhook_conf)::text ~~ '%upload-submission%'::text) THEN 'Upload to AWS S3'::text
                    WHEN ((se.webhook_conf)::text ~~ '%idox%'::text) THEN 'Submit to Idox Nexus'::text
                    ELSE (se.webhook_conf)::text
                END AS event_type,
                CASE
                    WHEN (seil.status = 200) THEN 'Success'::text
                    ELSE format('Failed (%s)'::text, seil.status)
                END AS status,
            (seil.response)::jsonb AS response,
            seil.created_at,
            (EXISTS ( SELECT 1
                   FROM retries r
                  WHERE (r.id = seil.id))) AS retry
           FROM (hdb_catalog.hdb_scheduled_events se
             LEFT JOIN hdb_catalog.hdb_scheduled_event_invocation_logs seil ON ((seil.event_id = se.id)))
          WHERE (((se.webhook_conf)::text !~~ '%email/%'::text) AND (seil.created_at >= '2024-01-01 00:00:00+00'::timestamp with time zone))
        ), all_events AS (
         SELECT payments.session_id,
            payments.event_id,
            payments.event_type,
            payments.status,
            payments.response,
            payments.created_at,
            payments.retry
           FROM payments
        UNION ALL
         SELECT submissions.session_id,
            submissions.event_id,
            submissions.event_type,
            submissions.status,
            submissions.response,
            submissions.created_at,
            submissions.retry
           FROM submissions
        )
 SELECT ls.flow_id,
    ae.session_id,
    ae.event_id,
    ae.event_type,
    ae.status,
    ae.response,
    ae.created_at,
    ae.retry,
    f.team_id,
    f.name AS flow_name
   FROM ((all_events ae
     LEFT JOIN lowcal_sessions ls ON ((ls.id = ae.session_id)))
     LEFT JOIN flows f ON ((f.id = ls.flow_id)))
  WHERE (ls.flow_id IS NOT NULL)
  ORDER BY ae.created_at DESC;
