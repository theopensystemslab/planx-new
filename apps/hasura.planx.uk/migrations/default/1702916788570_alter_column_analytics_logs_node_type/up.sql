-- ALTER COLUMN will fail if dependent view exists
DROP VIEW public.analytics_summary;

-- Update column type from integer to text
ALTER TABLE public.analytics_logs
ALTER COLUMN node_type TYPE TEXT 
USING node_type::text;

-- Do a one-time update of historic records
UPDATE public.analytics_logs SET node_type = 
    CASE 
        WHEN node_type = '1' THEN 'Flow'
        WHEN node_type = '3' THEN 'Result'
        WHEN node_type = '7' THEN 'TaskList'
        WHEN node_type = '8' THEN 'Notice'
        WHEN node_type = '9' THEN 'FindProperty'
        WHEN node_type = '10' THEN 'DrawBoundary'
        WHEN node_type = '11' THEN 'PlanningConstraints'
        WHEN node_type = '12' THEN 'PropertyInformation'
        WHEN node_type = '100' THEN 'Statement'
        WHEN node_type = '105' THEN 'Checklist'
        WHEN node_type = '110' THEN 'TextInput'
        WHEN node_type = '120' THEN 'DateInput'
        WHEN node_type = '130' THEN 'AddressInput'
        WHEN node_type = '135' THEN 'ContactInput'
        WHEN node_type = '140' THEN 'FileUpload'
        WHEN node_type = '145' THEN 'FileUploadAndLabel'
        WHEN node_type = '150' THEN 'NumberInput'
        WHEN node_type = '200' THEN 'Response'
        WHEN node_type = '250' THEN 'Content'
        WHEN node_type = '300' THEN 'InternalPortal'
        WHEN node_type = '310' THEN 'ExternalPortal'
        WHEN node_type = '360' THEN 'Section'
        WHEN node_type = '380' THEN 'SetValue'
        WHEN node_type = '400' THEN 'Pay'
        WHEN node_type = '500' THEN 'Filter'
        WHEN node_type = '600' THEN 'Review'
        WHEN node_type = '650' THEN 'Send'
        WHEN node_type = '700' THEN 'Calculate'
        WHEN node_type = '725' THEN 'Confirmation'
        WHEN node_type = '730' THEN 'NextSteps'
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
