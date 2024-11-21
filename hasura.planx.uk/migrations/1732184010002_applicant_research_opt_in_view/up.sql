CREATE OR REPLACE VIEW applicant_research_opt_in_view AS
WITH data AS (
    SELECT 
        ls.id, 
        ls.email, 
        ls.created_at AS application_started_at, 
        ls.submitted_at, 
        ls.data->'passport'->'data'->>'applicant.name.last' AS last_name, 
        ls.data->'passport'->'data'->>'applicant.name.first' AS first_name, 
        f.name AS flow_name, 
        t.name AS team_name 
    FROM 
        lowcal_sessions ls 
    JOIN 
        flows f ON ls.flow_id = f.id 
    JOIN 
        teams t ON t.id = f.team_id 
    WHERE 
        ls.data->'passport'->'data'->>'applicant.researchOptIn' = '["true"]'
)
SELECT 
    * 
FROM 
    data 
WHERE 
    last_name IS NOT NULL 
    AND first_name IS NOT NULL;
