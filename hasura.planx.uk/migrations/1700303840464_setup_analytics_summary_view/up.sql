CREATE OR REPLACE VIEW public.analytics_summary AS 
select 
	a.id as analytics_id,
	al.id as analytics_log_id,
	f.slug as service_slug,
	t.slug as team_slug,
	a.type as analytics_type,
	a.created_at as analytics_created_at,
	a.user_agent as user_agent,
	a.referrer as referrer,
	al.flow_direction as flow_direction,
	al.metadata as metadata,
	al.user_exit as is_user_exit,
	al.node_type as node_type,
	al.node_title as node_title,
	al.has_clicked_help as has_clicked_help,
	CAST(EXTRACT(EPOCH FROM (al.next_log_created_at - al.created_at)) as numeric (10, 1)) as time_spent_on_node_seconds
from analytics a
	left join analytics_logs al on a.id = al.analytics_id
	left join flows f on a.flow_id = f.id
	left join teams t on t.id = f.team_id;
