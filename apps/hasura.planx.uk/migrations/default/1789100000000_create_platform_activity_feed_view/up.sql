CREATE OR REPLACE VIEW "public"."platform_activity_feed" AS
WITH team_first_active AS (
    -- either when a team created with is_trial=false or has is_trial set to false later
    SELECT team_id, MIN(event_start) AS event_start
    FROM team_trial_history
    WHERE is_trial = false
    GROUP BY team_id
),
team_joined AS (
    -- "team joined PlanX" events, timestamped with when they went non-trial
    SELECT
        'team_joined:' || t.id::text AS id,
        'team_joined' AS type,
        tfa.event_start AS event_time,
        t.name AS team_name,
        NULL::text AS flow_name
    FROM teams t
    JOIN team_settings ts ON ts.team_id = t.id
    JOIN team_first_active tfa ON tfa.team_id = t.id
    WHERE ts.is_trial IS NOT TRUE
      AND t.name <> ALL (
        ARRAY ['Open Digital Planning'::text, 'Open Systems Lab'::text, 'PlanX'::text, 'Templates'::text, 'Testing'::text, 'WikiHouse'::text]
      )
),
service_online AS (
    -- "service set online" events, timestamped with when it first went online
    SELECT
        'service_online:' || f.id::text AS id,
        'service_online' AS type,
        flow_first_online_at(f.*) AS event_time,
        t.name AS team_name,
        f.name AS flow_name
    FROM flows f
    JOIN teams t ON t.id = f.team_id
    WHERE f.is_service IS TRUE
      AND f.archived_at IS NULL
      AND flow_first_online_at(f.*) IS NOT NULL
      AND t.name <> ALL (
        ARRAY ['Open Digital Planning'::text, 'Open Systems Lab'::text, 'PlanX'::text, 'Templates'::text, 'Testing'::text, 'WikiHouse'::text]
      )
)
SELECT * FROM team_joined
UNION ALL
SELECT * FROM service_online
ORDER BY event_time DESC;

COMMENT ON VIEW "public"."platform_activity_feed" IS E'Chronological feed of platform-wide activity for the Explore page: teams becoming active on PlanX (created as non-trial, or graduating out of trial mode) and services going online for the first time';
