DROP VIEW IF EXISTS public.analytics_summary;

-- Previous instance of view from hasura.planx.uk/migrations/1708016067772_alter_view_analytics_summary_unfold_metadata/up.sql
CREATE
OR REPLACE VIEW public.analytics_summary AS
select
  a.id as analytics_id,
  al.id as analytics_log_id,
  f.slug as service_slug,
  t.slug as team_slug,
  a.type as analytics_type,
  a.created_at as analytics_created_at,
  (user_agent -> 'os' ->> 'name') :: text AS operating_system,
  (user_agent -> 'browser' ->> 'name') :: text AS browser,
  (user_agent -> 'platform' ->> 'type') :: text AS platform,
  referrer,
  flow_direction,
  metadata ->> 'change' as change_metadata,
  metadata ->> 'back' as back_metadata,
  metadata ->> 'selectedUrls' as selected_urls,
  case
    when has_clicked_help then metadata
    else null
  end as help_metadata,
  al.user_exit as is_user_exit,
  node_type,
  node_title,
  has_clicked_help,
  input_errors,
  CAST(
    EXTRACT(
      EPOCH
      FROM
        (al.next_log_created_at - al.created_at)
    ) as numeric (10, 1)
  ) as time_spent_on_node_seconds,
  a.ended_at as analytics_ended_at,
  CAST(
    EXTRACT(
      EPOCH
      FROM
        (a.ended_at - a.created_at)
    ) / 60 as numeric (10, 1)
  ) as time_spent_on_analytics_session_minutes,
  node_id
from
  analytics a
  left join analytics_logs al on a.id = al.analytics_id
  left join flows f on a.flow_id = f.id
  left join teams t on t.id = f.team_id;