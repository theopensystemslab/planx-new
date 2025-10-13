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
    (al.allow_list_answers -> 'findProperty.action'::text) AS find_property_action,
    (al.allow_list_answers -> 'usedFOIYNPP'::text) AS used_foiynpp,
    (al.allow_list_answers -> 'propertyInformation.action'::text) AS property_information_action,
    (al.allow_list_answers -> 'planningConstraints.action'::text) AS planning_constraints_action,
    (al.allow_list_answers -> '_overrides'::text) AS overrides,
    (al.allow_list_answers -> 'rab.exitReason'::text) AS rab_exit_reason,
    (al.allow_list_answers -> 'service.type'::text) AS pre_app_service_type,
    (al.allow_list_answers -> 'application.information.harmful'::text) AS pre_app_harmful_info,
    (al.allow_list_answers -> 'application.information.sensitive'::text) AS pre_app_sensitive_info
   FROM (((analytics a
     LEFT JOIN analytics_logs al ON ((a.id = al.analytics_id)))
     LEFT JOIN flows f ON ((a.flow_id = f.id)))
     LEFT JOIN teams t ON ((t.id = f.team_id)));

CREATE OR REPLACE VIEW "public"."submission_services_summary" AS 
 WITH resumes_per_session AS (
         SELECT reconciliation_requests.session_id,
            count(reconciliation_requests.id) AS number_times_resumed
           FROM reconciliation_requests
          GROUP BY reconciliation_requests.session_id
        ), bops_agg AS (
         SELECT bops_applications.session_id,
            json_agg(json_build_object('id', bops_applications.bops_id, 'submittedAt', bops_applications.created_at, 'destinationUrl', bops_applications.destination_url) ORDER BY bops_applications.created_at DESC) AS bops_applications
           FROM bops_applications
          GROUP BY bops_applications.session_id
        ), email_agg AS (
         SELECT email_applications.session_id,
            json_agg(json_build_object('id', email_applications.id, 'recipient', email_applications.recipient, 'submittedAt', email_applications.created_at) ORDER BY email_applications.created_at DESC) AS email_applications
           FROM email_applications
          GROUP BY email_applications.session_id
        ), uniform_agg AS (
         SELECT uniform_applications.submission_reference,
            json_agg(json_build_object('id', uniform_applications.idox_submission_id, 'submittedAt', uniform_applications.created_at) ORDER BY uniform_applications.created_at DESC) AS uniform_applications
           FROM uniform_applications
          GROUP BY uniform_applications.submission_reference
        ), payment_requests_agg AS (
         SELECT payment_requests.session_id,
            json_agg(json_build_object('id', payment_requests.id, 'createdAt', payment_requests.created_at, 'paidAt', payment_requests.paid_at, 'govpayPaymentId', payment_requests.govpay_payment_id) ORDER BY payment_requests.created_at DESC) AS payment_requests
           FROM payment_requests
          GROUP BY payment_requests.session_id
        ), payment_status_agg AS (
         SELECT payment_status.session_id,
            json_agg(json_build_object('govpayPaymentId', payment_status.payment_id, 'createdAt', payment_status.created_at, 'status', payment_status.status) ORDER BY payment_status.created_at DESC) AS payment_status
           FROM payment_status
          GROUP BY payment_status.session_id
        ), s3_agg AS (
         SELECT s3_applications.session_id,
            json_agg(json_build_object('id', s3_applications.id, 'submittedAt', s3_applications.created_at) ORDER BY s3_applications.created_at DESC) AS s3_applications
           FROM s3_applications
          GROUP BY s3_applications.session_id
        )
 SELECT (ls.id)::text AS session_id,
    t.slug AS team_slug,
    f.slug AS service_slug,
    ls.created_at,
    ls.submitted_at,
    ((ls.submitted_at)::date - (ls.created_at)::date) AS session_length_days,
    ls.has_user_saved AS user_clicked_save,
    rps.number_times_resumed,
    ls.allow_list_answers,
    (ls.allow_list_answers -> 'proposal.projectType'::text) AS proposal_project_type,
    (ls.allow_list_answers -> 'application.declaration.connection'::text) AS application_declaration_connection,
    (ls.allow_list_answers -> 'property.type'::text) AS property_type,
    (ls.allow_list_answers -> 'drawBoundary.action'::text) AS draw_boundary_action,
    (ls.allow_list_answers -> 'user.role'::text) AS user_role,
    (ls.allow_list_answers -> 'property.constraints.planning'::text) AS property_constraints_planning,
        CASE
            WHEN (((pr.payment_requests)::jsonb IS NOT NULL) AND (jsonb_array_length((pr.payment_requests)::jsonb) > 0)) THEN true
            ELSE false
        END AS user_invited_to_pay,
    pr.payment_requests,
    ps.payment_status,
        CASE
            WHEN (((ba.bops_applications)::jsonb IS NOT NULL) AND (jsonb_array_length((ba.bops_applications)::jsonb) > 0)) THEN true
            ELSE false
        END AS sent_to_bops,
    ba.bops_applications,
        CASE
            WHEN (((ua.uniform_applications)::jsonb IS NOT NULL) AND (jsonb_array_length((ua.uniform_applications)::jsonb) > 0)) THEN true
            ELSE false
        END AS sent_to_uniform,
    ua.uniform_applications,
        CASE
            WHEN (((ea.email_applications)::jsonb IS NOT NULL) AND (jsonb_array_length((ea.email_applications)::jsonb) > 0)) THEN true
            ELSE false
        END AS sent_to_email,
    ea.email_applications,
    (ls.allow_list_answers -> 'findProperty.action'::text) AS find_property_action,
        CASE
            WHEN (((sa.s3_applications)::jsonb IS NOT NULL) AND (jsonb_array_length((sa.s3_applications)::jsonb) > 0)) THEN true
            ELSE false
        END AS sent_to_s3_power_automate,
    sa.s3_applications,
    (ls.allow_list_answers -> 'usedFOIYNPP'::text) AS used_foiynpp,
    (ls.allow_list_answers -> 'propertyInformation.action'::text) AS property_information_action,
    (ls.allow_list_answers -> 'planningConstraints.action'::text) AS planning_constraints_action,
    (ls.allow_list_answers -> '_overrides'::text) AS overrides,
    (ls.allow_list_answers -> 'rab.exitReason'::text) AS rab_exit_reason,
    (ls.allow_list_answers -> 'service.type'::text) AS pre_app_service_type,
    (ls.allow_list_answers -> 'application.information.harmful'::text) AS pre_app_harmful_info,
    (ls.allow_list_answers -> 'application.information.sensitive'::text) AS pre_app_sensitive_info
   FROM (((((((((lowcal_sessions ls
     LEFT JOIN flows f ON ((f.id = ls.flow_id)))
     LEFT JOIN teams t ON ((t.id = f.team_id)))
     LEFT JOIN resumes_per_session rps ON ((rps.session_id = (ls.id)::text)))
     LEFT JOIN payment_requests_agg pr ON ((pr.session_id = ls.id)))
     LEFT JOIN payment_status_agg ps ON ((ps.session_id = ls.id)))
     LEFT JOIN bops_agg ba ON ((ba.session_id = (ls.id)::text)))
     LEFT JOIN uniform_agg ua ON ((ua.submission_reference = (ls.id)::text)))
     LEFT JOIN email_agg ea ON ((ea.session_id = ls.id)))
     LEFT JOIN s3_agg sa ON ((sa.session_id = (ls.id)::text)))
  WHERE ((f.slug IS NOT NULL) AND (t.slug IS NOT NULL));

GRANT SELECT ON "public"."analytics_summary" TO metabase_read_only;
GRANT SELECT ON "public"."submission_services_summary" TO metabase_read_only;
