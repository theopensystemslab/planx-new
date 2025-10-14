DROP VIEW public.analytics_summary;

CREATE
OR REPLACE VIEW public.analytics_summary AS
select
	a.id as analytics_id,
	al.id as analytics_log_id,
	f.slug as service_slug,
	t.slug as team_slug,
	a.type as analytics_type,
	al.created_at as analytics_log_created_at,
	a.created_at as analytics_created_at,
	(user_agent -> 'os' ->> 'name') :: text AS operating_system,
	(user_agent -> 'browser' ->> 'name') :: text AS browser,
	(user_agent -> 'platform' ->> 'type') :: text AS platform,
	referrer,
	flow_direction,
	metadata ->> 'change' as change_metadata,
	metadata ->> 'back' as back_metadata,
	metadata ->> 'selectedUrls' as selected_urls,
	metadata ->> 'flag' as result_flag,
	metadata -> 'flagSet' as result_flagset,
	metadata -> 'displayText' ->> 'heading' as result_heading,
	metadata -> 'displayText' ->> 'description' as result_description,
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
	node_id,
	al.allow_list_answers as allow_list_answers,
    allow_list_answer_elements->>'proposal.projectType' AS proposal_project_type,
    allow_list_answer_elements->>'application.declaration.connection' AS application_declaration_connection,
    allow_list_answer_elements->>'property.type' AS property_type,
    allow_list_answer_elements->>'drawBoundary.action' AS draw_boundary_action,
    allow_list_answer_elements->>'user.role' AS user_role,
    allow_list_answer_elements->>'property.constraints.planning' AS property_constraints_planning
from
	analytics a
	left join analytics_logs al on a.id = al.analytics_id
	left join flows f on a.flow_id = f.id
	left join teams t on t.id = f.team_id
    left join lateral jsonb_array_elements(al.allow_list_answers) AS allow_list_answer_elements ON true;

--  After recreating the view grant Metabase access to it
GRANT SELECT ON public.analytics_summary TO metabase_read_only;
