-- ALTER COLUMN will fail if dependent view exists
DROP VIEW public.analytics_summary;

-- Update column type from integer to text
ALTER TABLE public.analytics_logs
ALTER COLUMN node_type TYPE INTEGER 
USING node_type::integer;

-- Do a one-time update of historic records
UPDATE public.analytics_logs SET node_type = 
    CASE 
        WHEN node_type = 'Flow' THEN 1
        WHEN node_type = 'Result' THEN 3
        WHEN node_type = 'TaskList' THEN 7
        WHEN node_type = 'Notice' THEN 8
        WHEN node_type = 'FindProperty' THEN 9
        WHEN node_type = 'DrawBoundary' THEN 10
        WHEN node_type = 'PlanningConstraints' THEN 11
        WHEN node_type = 'PropertyInformation' THEN 12
        WHEN node_type = 'Statement' THEN 100
        WHEN node_type = 'Checklist' THEN 105
        WHEN node_type = 'TextInput' THEN 110
        WHEN node_type = 'DateInput' THEN 120
        WHEN node_type = 'AddressInput' THEN 130
        WHEN node_type = 'ContactInput' THEN 135
        WHEN node_type = 'FileUpload' THEN 140
        WHEN node_type = 'FileUploadAndLabel' THEN 145 
        WHEN node_type = 'NumberInput' THEN 150
        WHEN node_type = 'Response' THEN 200
        WHEN node_type = 'Content' THEN 250
        WHEN node_type = 'InternalPortal' THEN 300 
        WHEN node_type = 'ExternalPortal' THEN 310
        WHEN node_type = 'Section' THEN 360
        WHEN node_type = 'SetValue' THEN 380
        WHEN node_type = 'Pay' THEN 400
        WHEN node_type = 'Filter' THEN 500
        WHEN node_type = 'Review' THEN 600
        WHEN node_type = 'Send' THEN 650
        WHEN node_type = 'Calculate' THEN 700 
        WHEN node_type = 'Confirmation' THEN 725
        WHEN node_type = 'NextSteps' THEN 730
        ELSE null
    END;

-- Re-create the view
CREATE OR REPLACE VIEW public.analytics_summary AS 
select 
	a.id as analytics_id,
	al.id as analytics_log_id,
	f.slug as service_slug,
	t.slug as team_slug,
	a.type as analytics_type,
	a.created_at as analytics_created_at,
	user_agent,
	referrer,
	flow_direction,
	metadata,
	al.user_exit as is_user_exit,
	node_type,
	node_title,
	has_clicked_help,
	input_errors,
	CAST(EXTRACT(EPOCH FROM (al.next_log_created_at - al.created_at)) as numeric (10, 1)) as time_spent_on_node_seconds,
	a.ended_at as analytics_ended_at,
	CAST(EXTRACT(EPOCH FROM (a.ended_at - a.created_at))/60 as numeric (10, 1)) as time_spent_on_analytics_session_minutes,
	node_id
from analytics a
	left join analytics_logs al on a.id = al.analytics_id
	left join flows f on a.flow_id = f.id
	left join teams t on t.id = f.team_id;
