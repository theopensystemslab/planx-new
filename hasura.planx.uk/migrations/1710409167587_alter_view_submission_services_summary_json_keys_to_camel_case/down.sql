drop view public.submission_services_summary;

-- Previous instance of view from hasura.planx.uk/migrations/1710258204814_alter_view_submission_services_summary_expand_application_data
create or replace view "public"."submission_services_summary" as
 with resumes_per_session as (
    select 
        session_id,
        count(id) as number_times_resumed
    from reconciliation_requests
    group by session_id
), bops_agg as (
    select
        session_id,
        json_agg(
            json_build_object(
                'id', bops_id,
                'submitted_at', created_at,
                'destination_url', destination_url
            ) order by created_at desc
        ) as bops_applications
    from bops_applications
    group by session_id
), email_agg as (
    select
        session_id,
        json_agg(
            json_build_object(
                'id', id,
                'recipient', recipient,
                'submitted_at', created_at
            ) order by created_at desc
        ) as email_applications
    from email_applications
    group by session_id
), uniform_agg as (
    select
        submission_reference,
        json_agg(
            json_build_object(
                'id', idox_submission_id,
                'submitted_at', created_at
            ) order by created_at desc
        ) as uniform_applications
    from uniform_applications
    group by submission_reference
), payment_requests_agg as (
    select
        session_id,
        json_agg(
            json_build_object(
                'id', id,
                'created_at', created_at,
                'paid_at', paid_at,
                'govpay_payment_id', govpay_payment_id
            ) order by created_at desc
        ) as payment_requests
    from payment_requests
    group by session_id
), payment_status_agg as (
    select
        session_id,
        json_agg(
            json_build_object(
                'govpay_payment_id', payment_id,
                'created_at', created_at,
                'status', status
            ) order by created_at desc
        ) as payment_status
    from payment_status
    group by session_id
)
select 
    ls.id::text as session_id,
    t.slug as team_slug,
    f.slug as service_slug,
    ls.created_at,
    ls.submitted_at,
    (ls.submitted_at::date - ls.created_at::date) as session_length_days,
    ls.has_user_saved as user_clicked_save,
    rps.number_times_resumed,
    case
        when pr.payment_requests::jsonb is not null and jsonb_array_length(pr.payment_requests::jsonb) > 0
        then true
        else false
    end as user_invited_to_pay,
    pr.payment_requests,
    ps.payment_status,
    case 
      when ba.bops_applications::jsonb is not null and jsonb_array_length(ba.bops_applications::jsonb) > 0
      then true
      else false
    end as sent_to_bops,
    ba.bops_applications,
    case 
      when ua.uniform_applications::jsonb is not null and jsonb_array_length(ua.uniform_applications::jsonb) > 0
      then true
      else false
    end as sent_to_uniform,
    ua.uniform_applications,
    case 
      when ea.email_applications::jsonb is not null and jsonb_array_length(ea.email_applications::jsonb) > 0
      then true
      else false
    end as sent_to_email,
    ea.email_applications
from lowcal_sessions ls
 left join flows f on f.id = ls.flow_id
 left join teams t on t.id = f.team_id
 left join resumes_per_session rps on rps.session_id = ls.id::text
 left join payment_requests_agg pr on pr.session_id = ls.id
 left join payment_status_agg ps on ps.session_id = ls.id
 left join bops_agg ba on ba.session_id = ls.id::text
 left join uniform_agg ua on ua.submission_reference = ls.id::text
 left join email_agg ea on ea.session_id = ls.id
where f.slug is not null
 and t.slug is not null;