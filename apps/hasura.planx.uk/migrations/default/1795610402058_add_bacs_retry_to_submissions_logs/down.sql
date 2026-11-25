-- daily_failed_submissions depends on submission_services_log, so is dropped and recreated with it
DROP VIEW IF EXISTS "public"."daily_failed_submissions";
DROP VIEW IF EXISTS "public"."submission_services_log";
DROP VIEW IF EXISTS "public"."submissions_grouped";

CREATE VIEW "public"."submission_services_log" AS 
 WITH payments AS (
         SELECT ps.session_id,
            COALESCE(ps.payment_id, ps.stripe_payment_id) AS event_id,
            'Pay'::text AS event_type,
            initcap(COALESCE(ps.status, ps.stripe_status)) AS status,
                CASE
                    WHEN (ps.payment_id IS NOT NULL) THEN jsonb_build_object('status', ps.status, 'description', pse.comment, 'govuk_pay_reference', ps.payment_id, 'govuk_pay_metadata', ps.gov_pay_metadata)
                    WHEN (ps.stripe_payment_id IS NOT NULL) THEN jsonb_build_object('status', ps.stripe_status, 'description', spse.comment, 'stripe_reference', ps.stripe_payment_id, 'stripe_metadata', ps.stripe_metadata)
                    ELSE NULL::jsonb
                END AS response,
            ps.created_at,
            false AS retry
           FROM payment_status ps
             LEFT JOIN payment_status_enum pse ON pse.value = ps.status
             LEFT JOIN stripe_payment_status_enum spse ON spse.value = ps.stripe_status
          WHERE ps.status::text IS DISTINCT FROM 'created' 
            AND ps.stripe_status::text IS DISTINCT FROM 'created'
            AND ps.created_at >= '2024-01-01 00:00:00+00'::timestamp with time zone
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
                    WHEN ((se.webhook_conf)::text ~~ '%?notify=false%'::text) THEN 'Upload to AWS S3 (no notification)'::text
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
          WHERE ((seil.created_at >= '2024-01-01 00:00:00+00'::timestamp with time zone) AND (((se.webhook_conf)::text ~~ '%bops%'::text) OR ((se.webhook_conf)::text ~~ '%uniform%'::text) OR ((se.webhook_conf)::text ~~ '%email-submission%'::text) OR ((se.webhook_conf)::text ~~ '%?notify=false%'::text) OR ((se.webhook_conf)::text ~~ '%upload-submission%'::text) OR ((se.webhook_conf)::text ~~ '%idox%'::text)))
        ), session_starts AS (
         SELECT ls_1.id AS session_id,
            (ls_1.id)::text AS event_id,
            'Started session'::text AS event_type,
            'Success'::text AS status,
            NULL::jsonb AS response,
            ls_1.created_at,
            false AS retry
           FROM lowcal_sessions ls_1
          WHERE ((ls_1.created_at >= '2024-01-01 00:00:00+00'::timestamp with time zone) AND (ls_1.created_at IS NOT NULL))
        ), payment_invites AS (
         SELECT pr.session_id,
            (pr.id)::text AS event_id,
            'Invited to pay'::text AS event_type,
            'Success'::text AS status,
            jsonb_build_object('payee_email', pr.payee_email, 'payee_name', pr.payee_name, 'paid_at', pr.paid_at) AS response,
            pr.created_at,
            false AS retry
           FROM payment_requests pr
          WHERE (pr.created_at >= '2024-01-01 00:00:00+00'::timestamp with time zone)
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
        UNION ALL
         SELECT session_starts.session_id,
            session_starts.event_id,
            session_starts.event_type,
            session_starts.status,
            session_starts.response,
            session_starts.created_at,
            session_starts.retry
           FROM session_starts
        UNION ALL
         SELECT payment_invites.session_id,
            payment_invites.event_id,
            payment_invites.event_type,
            payment_invites.status,
            payment_invites.response,
            payment_invites.created_at,
            payment_invites.retry
           FROM payment_invites
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
    f.name AS flow_name,
        CASE
            WHEN (ls.submitted_at < (now() - '6 mons'::interval)) THEN 'No longer retained'::text
            ELSE COALESCE(((((ls.data -> 'passport'::text) -> 'data'::text) -> '_address'::text) ->> 'single_line_address'::text), ((((ls.data -> 'passport'::text) -> 'data'::text) -> '_address'::text) ->> 'title'::text), 'Not applicable'::text)
        END AS address
   FROM ((all_events ae
     LEFT JOIN lowcal_sessions ls ON ((ls.id = ae.session_id)))
     LEFT JOIN flows f ON ((f.id = ls.flow_id)))
  WHERE (ls.flow_id IS NOT NULL)
  ORDER BY ae.created_at DESC;

CREATE VIEW "public"."submissions_grouped" AS 
 WITH payments AS (
         SELECT ps.session_id,
            'Pay'::text AS event_type,
            initcap(COALESCE(ps.status, ps.stripe_status)) AS status,
            ps.created_at
           FROM payment_status ps
          WHERE 
            ps.status::text IS DISTINCT FROM 'created' 
            AND ps.stripe_status::text IS DISTINCT FROM 'created'
            AND ps.created_at >= '2024-01-01 00:00:00+00'::timestamp with time zone
        ), invitations_to_pay AS (
         SELECT pr.session_id,
            'Invited to pay'::text AS event_type,
            'Success'::text AS status,
            pr.created_at
           FROM payment_requests pr
        ), submissions AS (
         SELECT ((((seil.request -> 'payload'::text) -> 'payload'::text) ->> 'sessionId'::text))::uuid AS session_id,
                CASE
                    WHEN ((se.webhook_conf)::text ~~ '%bops%'::text) THEN 'Submit to BOPS'::text
                    WHEN ((se.webhook_conf)::text ~~ '%uniform%'::text) THEN 'Submit to Uniform'::text
                    WHEN ((se.webhook_conf)::text ~~ '%email-submission%'::text) THEN 'Send to email'::text
                    WHEN ((se.webhook_conf)::text ~~ '%?notify=false%'::text) THEN 'Upload to AWS S3 (no notification)'::text
                    WHEN ((se.webhook_conf)::text ~~ '%upload-submission%'::text) THEN 'Upload to AWS S3'::text
                    WHEN ((se.webhook_conf)::text ~~ '%idox%'::text) THEN 'Submit to Idox Nexus'::text
                    ELSE (se.webhook_conf)::text
                END AS event_type,
                CASE
                    WHEN (seil.status = 200) THEN 'Success'::text
                    ELSE format('Failed (%s)'::text, seil.status)
                END AS status,
            seil.created_at
           FROM (hdb_catalog.hdb_scheduled_events se
             LEFT JOIN hdb_catalog.hdb_scheduled_event_invocation_logs seil ON ((seil.event_id = se.id)))
          WHERE ((seil.created_at >= '2024-01-01 00:00:00+00'::timestamp with time zone) AND (((se.webhook_conf)::text ~~ '%bops%'::text) OR ((se.webhook_conf)::text ~~ '%uniform%'::text) OR ((se.webhook_conf)::text ~~ '%email-submission%'::text) OR ((se.webhook_conf)::text ~~ '%?notify=false%'::text) OR ((se.webhook_conf)::text ~~ '%upload-submission%'::text) OR ((se.webhook_conf)::text ~~ '%idox%'::text)))
        ), all_events AS (
         SELECT payments.session_id,
            payments.event_type,
            payments.status,
            payments.created_at
           FROM payments
        UNION ALL
         SELECT invitations_to_pay.session_id,
            invitations_to_pay.event_type,
            invitations_to_pay.status,
            invitations_to_pay.created_at
           FROM invitations_to_pay
        UNION ALL
         SELECT submissions.session_id,
            submissions.event_type,
            submissions.status,
            submissions.created_at
           FROM submissions
        ), latest_per_event_type AS (
         SELECT DISTINCT ON (all_events.session_id, all_events.event_type) all_events.session_id,
            all_events.event_type,
            all_events.status,
            all_events.created_at
           FROM all_events
          ORDER BY all_events.session_id, all_events.event_type, all_events.created_at DESC
        ), representative_event AS (
         SELECT DISTINCT ON (latest_per_event_type.session_id) latest_per_event_type.session_id,
            latest_per_event_type.event_type,
            latest_per_event_type.status,
            latest_per_event_type.created_at
           FROM latest_per_event_type
          ORDER BY latest_per_event_type.session_id, (latest_per_event_type.status ~~ 'Failed%'::text) DESC, latest_per_event_type.created_at DESC
        )
 SELECT f.id AS flow_id,
    re.session_id,
    re.event_type,
    re.status,
    re.created_at,
    f.team_id,
    f.name AS flow_name,
        CASE
            WHEN (ls.submitted_at < (now() - '6 mons'::interval)) THEN 'No longer retained'::text
            ELSE COALESCE(((((ls.data -> 'passport'::text) -> 'data'::text) -> '_address'::text) ->> 'single_line_address'::text), ((((ls.data -> 'passport'::text) -> 'data'::text) -> '_address'::text) ->> 'title'::text), 'Not applicable'::text)
        END AS address
   FROM ((representative_event re
     LEFT JOIN lowcal_sessions ls ON ((ls.id = re.session_id)))
     LEFT JOIN flows f ON ((f.id = ls.flow_id)))
  WHERE (ls.flow_id IS NOT NULL)
  ORDER BY re.created_at DESC;

CREATE OR REPLACE VIEW "public"."daily_failed_submissions" AS (
	with send_event_statuses_per_session as (
			select
					session_id,
			event_type,
			flow_name,
			team_id,
					array_agg(status) as statuses,
			max(created_at) as last_event
			from submission_services_log
			where event_type != 'Pay'
			and created_at >= NOW() - INTERVAL '24 hours'
			group by session_id, event_type, flow_name, team_id
	)
	select 
		t.name,
		s.flow_name,
		s.session_id, 
		s.event_type,
		s.statuses,
		s.last_event
	from send_event_statuses_per_session s
		join teams t on s.team_id = t.id
	where 'Success' != ALL(statuses)
);
