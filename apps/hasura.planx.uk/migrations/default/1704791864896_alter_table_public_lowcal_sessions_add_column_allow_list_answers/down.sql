ALTER TABLE "public"."lowcal_sessions" DROP COLUMN "allow_list_answers" CASCADE;

DROP VIEW IF EXISTS "public"."submission_services_summary";
CREATE OR REPLACE VIEW "public"."submission_services_summary" AS 
  with resumes_per_session as (
      select 
          session_id,
          count(id) as number_times_resumed
      from reconciliation_requests
      group by session_id
  )
  select 
      ls.id as session_id,
      t.slug as team_slug,
      f.slug as service_slug,
      ls.created_at,
      ls.submitted_at,
      (ls.submitted_at::date - ls.created_at::date) as session_length_days,
      ls.has_user_saved as user_clicked_save,
      rps.number_times_resumed,
      case 
        when pr.id is null
        then false
        else true
      end as user_invited_to_pay,
      case 
        when ba.bops_id is null
        then false
        else true
      end as sent_to_bops,
      case 
        when ua.idox_submission_id is null
        then false
        else true
      end as sent_to_uniform,
      case 
        when ea.id is null
        then false
        else true
      end as sent_to_email
  from lowcal_sessions ls
  left join flows f on f.id = ls.flow_id
  left join teams t on t.id = f.team_id
  left join resumes_per_session rps on rps.session_id = ls.id::text
  left join payment_requests pr on pr.session_id = ls.id
  left join bops_applications ba on ba.session_id = ls.id::text
  left join uniform_applications ua on ua.submission_reference = ls.id::text
  left join email_applications ea on ea.session_id = ls.id
  where f.slug IS NOT NULL
  and t.slug IS NOT NULL;