CREATE OR REPLACE VIEW "public"."platform_activity_feed" AS
WITH team_joined AS (
    -- "team joined PlanX" events, timestamped with when the team was created
    SELECT
        'team_joined:' || t.id::text AS id,
        'team_joined' AS type,
        t.created_at AS event_time,
        t.name AS team_name,
        t.slug AS team_slug,
        COALESCE(ts.is_trial, false) AS is_trial,
        NULL::text AS flow_name,
        NULL::text AS flow_slug
    FROM teams t
    LEFT JOIN team_settings ts ON ts.team_id = t.id
    WHERE t.name <> ALL (
        ARRAY ['Open Digital Planning'::text, 'Open Systems Lab'::text, 'PlanX'::text, 'Templates'::text, 'Testing'::text, 'WikiHouse'::text, 'Council Onboarding'::text, 'Strategic and Local Plan'::text, 'Plan✕ Academy'::text]
    )
),
service_online AS (
    -- "service set online" events, timestamped with when it first went online
    SELECT
        'service_online:' || f.id::text AS id,
        'service_online' AS type,
        flow_first_online_at(f.*) AS event_time,
        t.name AS team_name,
        t.slug AS team_slug,
        COALESCE(ts.is_trial, false) AS is_trial,
        f.name AS flow_name,
        f.slug AS flow_slug
    FROM flows f
    JOIN teams t ON t.id = f.team_id
    LEFT JOIN team_settings ts ON ts.team_id = t.id
    WHERE f.is_service IS TRUE
      AND f.archived_at IS NULL
      AND flow_first_online_at(f.*) IS NOT NULL
      AND t.name <> ALL (
        ARRAY ['Open Digital Planning'::text, 'Open Systems Lab'::text, 'PlanX'::text, 'Templates'::text, 'Testing'::text, 'WikiHouse'::text, 'Council Onboarding'::text, 'Strategic and Local Plan'::text, 'Plan✕ Academy'::text]
      )
)
SELECT * FROM team_joined
UNION ALL
SELECT * FROM service_online
ORDER BY event_time DESC;

COMMENT ON VIEW "public"."platform_activity_feed" IS E'Chronological feed of platform-wide activity for the Explore page: teams joining PlanX (teams.created_at) and services going online for the first time. Includes trial teams, flagged via is_trial (team_settings.is_trial). Excludes non-LPA internal/service teams by name.';
