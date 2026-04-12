-- OLD SQL does not properly account for ITP (joins on payment request id, not session id) and confirmation emails (db triggered, not scheduled)
CREATE OR REPLACE VIEW public.email_events_log AS 
WITH retries AS (
   SELECT hdb_scheduled_event_invocation_logs.id
   FROM hdb_catalog.hdb_scheduled_event_invocation_logs
   WHERE ((hdb_scheduled_event_invocation_logs.event_id, hdb_scheduled_event_invocation_logs.created_at) IN ( 
      SELECT 
         seil.event_id,
         max(seil.created_at) AS max
      FROM (hdb_catalog.hdb_scheduled_event_invocation_logs seil
      LEFT JOIN hdb_catalog.hdb_scheduled_events se ON ((se.id = seil.event_id)))
      WHERE (se.tries > 1)
      GROUP BY seil.event_id))
), emails AS (
   SELECT 
      ((((seil.request -> 'payload'::text) -> 'payload'::text) ->> 'sessionId'::text))::uuid AS session_id,
      se.id AS event_id,
   CASE
      WHEN ((webhook_conf)::text ~~ '%/send-email/expiry"'::text) THEN 'Session expiry'::text
      WHEN ((webhook_conf)::text ~~ '%/send-email/reminder"'::text) THEN 'Session reminder'::text
      WHEN ((webhook_conf)::text ~~ '%/send-email/confirmation"'::text) THEN 'Submission confirmation'::text
      WHEN ((webhook_conf)::text ~~ '%/send-email/invite-to-pay"'::text) THEN 'Invitation to pay'::text
      WHEN ((webhook_conf)::text ~~ '%/send-email/invite-to-pay-agent"'::text) THEN 'Invitation to pay - agent'::text
      WHEN ((webhook_conf)::text ~~ '%/send-email/payment-expiry"'::text) THEN 'Payment expiry'::text
      WHEN ((webhook_conf)::text ~~ '%/send-email/payment-expiry-agent"'::text) THEN 'Payment expiry - agent'::text
      WHEN ((webhook_conf)::text ~~ '%/send-email/payment-reminder"'::text) THEN 'Payment reminder'::text
      WHEN ((webhook_conf)::text ~~ '%/send-email/payment-reminder-agent"'::text) THEN 'Payment reminder - agent'::text
      ELSE (webhook_conf)::text
   END AS event_type,
   CASE
      WHEN (seil.status = 200) THEN 'Success'::text
      ELSE format('Failed (%s)'::text, seil.status)
   END AS status,
   (seil.response)::jsonb AS response,
   seil.created_at,
   (EXISTS (
      SELECT 1 FROM retries r WHERE (r.id = seil.id))) AS retry
      FROM (hdb_catalog.hdb_scheduled_events se
         LEFT JOIN hdb_catalog.hdb_scheduled_event_invocation_logs seil ON ((seil.event_id = se.id)))
      WHERE (((se.webhook_conf)::text ~~ '%/send-email/%'::text) AND (seil.created_at >= '2024-01-01 00:00:00+00'::timestamp with time zone))
)
SELECT 
   ls.flow_id,
   e.session_id,
   e.event_id,
   e.event_type,
   e.status,
   e.response,
   e.created_at,
   e.retry
FROM (emails e LEFT JOIN lowcal_sessions ls ON ((ls.id = e.session_id)))
WHERE (ls.flow_id IS NOT NULL)
ORDER BY e.created_at DESC;
