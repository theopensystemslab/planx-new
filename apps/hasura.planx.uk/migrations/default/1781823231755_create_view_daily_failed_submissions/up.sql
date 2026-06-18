CREATE OR REPLACE VIEW daily_failed_submissions AS (
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
