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
    sa.s3_applications
   FROM ((((((((lowcal_sessions ls
     LEFT JOIN flows f ON ((f.id = ls.flow_id)))
     LEFT JOIN teams t ON ((t.id = f.team_id)))
     LEFT JOIN resumes_per_session rps ON ((rps.session_id = (ls.id)::text)))
     LEFT JOIN payment_requests_agg pr ON ((pr.session_id = ls.id)))
     LEFT JOIN payment_status_agg ps ON ((ps.session_id = ls.id)))
     LEFT JOIN bops_agg ba ON ((ba.session_id = (ls.id)::text)))
     LEFT JOIN uniform_agg ua ON ((ua.submission_reference = (ls.id)::text)))
     LEFT JOIN email_agg ea ON ((ea.session_id = ls.id))
     LEFT JOIN s3_agg sa ON ((sa.session_id = (ls.id)::text)))
  WHERE ((f.slug IS NOT NULL) AND (t.slug IS NOT NULL));
