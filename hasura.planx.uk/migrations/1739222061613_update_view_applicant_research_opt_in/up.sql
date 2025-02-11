DROP VIEW IF EXISTS "public"."applicant_research_opt_in_view";
CREATE OR REPLACE VIEW "public"."applicant_research_opt_in_view" AS 
WITH data AS (
    SELECT 
        ls.id as planx_reference_number, 
        ls.email, 
        ls.created_at AS application_started_at, 
        ls.submitted_at,
        COALESCE(
            ls.data->'passport'->'data'->'_address'->>'single_line_address',
            ls.data->'passport'->'data'->'_address'->>'title'
        ) as site_address,
        ls.data->'passport'->'data'->'user.role'->>0 AS user_role,
        CASE
            WHEN ls.data->'passport'->'data'->'user.role'->>0 IN ('agent','proxy')
            THEN ls.data->'passport'->'data'->>'applicant.agent.name.last'
            ELSE ls.data->'passport'->'data'->>'applicant.name.last'
        END AS last_name,
        CASE
            WHEN ls.data->'passport'->'data'->'user.role'->>0 IN ('agent','proxy')
            THEN ls.data->'passport'->'data'->>'applicant.agent.name.first' 
            ELSE ls.data->'passport'->'data'->>'applicant.name.first'
        END AS first_name,
        f.name AS flow_name, 
        t.name AS team_name 
    FROM lowcal_sessions ls 
    JOIN flows f ON ls.flow_id = f.id 
    JOIN teams t ON t.id = f.team_id 
    WHERE ls.data->'passport'->'data'->>'applicant.researchOptIn' = '["true"]'
)
SELECT * 
FROM data 
WHERE last_name IS NOT NULL 
    AND first_name IS NOT NULL;
