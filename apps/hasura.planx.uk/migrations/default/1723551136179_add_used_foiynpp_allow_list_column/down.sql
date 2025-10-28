CREATE OR REPLACE VIEW "public"."analytics_summary" AS
 SELECT a.id AS analytics_id,
    al.id AS analytics_log_id,
    f.slug AS service_slug,
    t.slug AS team_slug,
    a.type AS analytics_type,
    al.created_at AS analytics_log_created_at,
    a.created_at AS analytics_created_at,
    ((a.user_agent -> 'os'::text) ->> 'name'::text) AS operating_system,
    ((a.user_agent -> 'browser'::text) ->> 'name'::text) AS browser,
    ((a.user_agent -> 'platform'::text) ->> 'type'::text) AS platform,
    a.referrer,
    al.flow_direction,
    (al.metadata ->> 'change'::text) AS change_metadata,
    (al.metadata ->> 'back'::text) AS back_metadata,
    (al.metadata ->> 'selectedUrls'::text) AS selected_urls,
    (al.metadata ->> 'flag'::text) AS result_flag,
    (al.metadata -> 'flagSet'::text) AS result_flagset,
    ((al.metadata -> 'displayText'::text) ->> 'heading'::text) AS result_heading,
    ((al.metadata -> 'displayText'::text) ->> 'description'::text) AS result_description,
    (al.metadata -> 'helpTextUseful'::text) AS help_text_useful,
        CASE
            WHEN al.has_clicked_help THEN al.metadata
            ELSE NULL::jsonb
        END AS help_metadata,
    al.user_exit AS is_user_exit,
    al.node_type,
    al.node_title,
    al.has_clicked_help,
    al.input_errors,
    (date_part('epoch'::text, (al.next_log_created_at - al.created_at)))::numeric(10,1) AS time_spent_on_node_seconds,
    a.ended_at AS analytics_ended_at,
    ((date_part('epoch'::text, (a.ended_at - a.created_at)) / (60)::double precision))::numeric(10,1) AS time_spent_on_analytics_session_minutes,
    al.node_id,
    al.allow_list_answers,
    (al.allow_list_answers -> 'proposal.projectType'::text) AS proposal_project_type,
    (al.allow_list_answers -> 'application.declaration.connection'::text) AS application_declaration_connection,
    (al.allow_list_answers -> 'property.type'::text) AS property_type,
    (al.allow_list_answers -> 'drawBoundary.action'::text) AS draw_boundary_action,
    (al.allow_list_answers -> 'user.role'::text) AS user_role,
    (al.allow_list_answers -> 'property.constraints.planning'::text) AS property_constraints_planning,
    (al.allow_list_answers -> 'findProperty.action'::text) AS find_property_action
   FROM (((analytics a
     LEFT JOIN analytics_logs al ON ((a.id = al.analytics_id)))
     LEFT JOIN flows f ON ((a.flow_id = f.id)))
     LEFT JOIN teams t ON ((t.id = f.team_id)));
