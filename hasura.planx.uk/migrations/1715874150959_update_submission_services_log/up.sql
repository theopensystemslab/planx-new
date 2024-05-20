create or replace view public.submission_services_log as 
with payments as (
    select 
      ps.session_id,
      ps.payment_id::text as event_id,
      'Pay' as event_type,
      initcap(ps.status) as status,
      jsonb_build_object(
        'status', ps.status, 
        'description', pse.comment, 
        'govuk_pay_reference', ps.payment_id::text
      ) as response,
      ps.created_at,
      false as retry
    from payment_status ps
      left join payment_status_enum pse on pse.value = ps.status
    where ps.status != 'created'
      and ps.created_at >= '2024-01-01'
), retries as (
    select 
      id 
    from hdb_catalog.hdb_scheduled_event_invocation_logs
    where (event_id, created_at) in (
      select 
        seil.event_id,
        max(seil.created_at) 
      from hdb_catalog.hdb_scheduled_event_invocation_logs seil
        left join hdb_catalog.hdb_scheduled_events se on se.id = seil.event_id 
      where se.tries > 1 
      group by seil.event_id
    )
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
      seil.created_at,
      exists(select 1 from retries r where r.id = seil.id) as retry
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
