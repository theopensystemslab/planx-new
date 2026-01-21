DROP VIEW "public"."email_events_log";

-- Fully recreate from scratch (do not replace)
CREATE VIEW "public"."email_events_log" AS
WITH scheduled_emails AS (
    SELECT
    	id as event_id,
    	'Scheduled' as event_trigger,
    	created_at,
    	scheduled_time,
    	(payload ->> 'sessionId')::uuid as session_id,
    	(payload ->> 'paymentRequestId')::uuid as payment_request_id,
    	CASE
    	  WHEN ((webhook_conf)::text ~~ '%/save"'::text) THEN 'Session saved'::text
    	  WHEN ((webhook_conf)::text ~~ '%/expiry"'::text) THEN 'Session expiry'::text
    	  WHEN ((webhook_conf)::text ~~ '%/reminder"'::text) THEN 'Session reminder'::text
    	  WHEN ((webhook_conf)::text ~~ '%/invite-to-pay"'::text) THEN 'Invitation to pay'::text
    	  WHEN ((webhook_conf)::text ~~ '%/invite-to-pay-agent"'::text) THEN 'Invitation to pay - agent'::text
    	  WHEN ((webhook_conf)::text ~~ '%/payment-expiry"'::text) THEN 'Payment expiry'::text
    	  WHEN ((webhook_conf)::text ~~ '%/payment-expiry-agent"'::text) THEN 'Payment expiry - agent'::text
    	  WHEN ((webhook_conf)::text ~~ '%/payment-reminder"'::text) THEN 'Payment reminder'::text
    	  WHEN ((webhook_conf)::text ~~ '%/payment-reminder-agent"'::text) THEN 'Payment reminder - agent'::text
    	  ELSE (webhook_conf)::text
       END AS event_type,
       status
    FROM hdb_catalog.hdb_scheduled_events
    WHERE (webhook_conf)::text ~~ '%/send-email/%'
), database_triggered_emails AS (
    SELECT
         id as event_id,
         'Database' as event_trigger,
          created_at,
          created_at as scheduled_time,
         (payload -> 'data' -> 'new' -> 'data' ->> 'sessionId')::uuid as session_id,
         null::uuid as payment_request_id,
         'Submission confirmation' as event_type,
         case 
         	WHEN delivered = true THEN 'Delivered'
        	WHEN error = true THEN 'Errored'
        	ELSE 'Unknown'
         END as status
    FROM hdb_catalog.event_log 
    WHERE trigger_name = 'email_user_submission_confirmation'
), emails AS (
    SELECT * FROM scheduled_emails 
        UNION ALL
    SELECT * FROM database_triggered_emails
)
SELECT 
	coalesce(e.session_id, ls.id, pr.session_id) as session_id,
	e.event_id,
	e.event_trigger,
	e.event_type,
	e.created_at,
	e.scheduled_time,
	e.status
FROM emails e
  LEFT JOIN lowcal_sessions ls on ls.id = e.session_id
  LEFT JOIN payment_requests pr on pr.id = e.payment_request_id;
