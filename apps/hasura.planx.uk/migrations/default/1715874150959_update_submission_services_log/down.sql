create or replace view public.submission_services_log as 
with payments as (
    select 
      session_id,
      payment_id::text as event_id,
      'Pay' as event_type,
      initcap(status) as status,
      '{}'::jsonb as response,
      created_at
    from payment_status
    where status != 'created'
      and created_at >= '2024-01-01'
), submissions as (
    select 
      (seil.request -> 'payload' -> 'payload' ->> 'sessionId')::uuid as session_id,
      se.id as event_id,
      case 
        when se.webhook_conf::text like '%bops%' then 'Submit to BOPS'
        when se.webhook_conf::text like '%uniform%' then 'Submit to Uniform'
        when se.webhook_conf::text like '%email-submission%' then 'Send to email'
        when se.webhook_conf::text like '%upload-submission%' then 'Upload to AWS S3'
        else se.webhook_conf::text
      end as event_type,
      case 
        when seil.status = 200 then 'Success'
        else format('Failed (%s)', seil.status)
      end as status,
      seil.response::jsonb,
      seil.created_at
    from hdb_catalog.hdb_scheduled_events se
      left join hdb_catalog.hdb_scheduled_event_invocation_logs seil on seil.event_id = se.id
    where se.webhook_conf::text not like '%email/%'
      and seil.created_at >= '2024-01-01'
), all_events as (
    select * from payments 
    union all
    select * from submissions
)
SELECT
  ls.flow_id,
  ae.*
FROM all_events ae
  left join public.lowcal_sessions ls on ls.id = ae.session_id
WHERE ls.flow_id is not null
order by ae.created_at desc;
