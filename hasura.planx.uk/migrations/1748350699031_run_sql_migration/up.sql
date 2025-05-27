CREATE VIEW "public"."planx_website_stats" AS
SELECT
  (
    SELECT
      COUNT(*)
    FROM
      (
        SELECT
          "public"."analytics_summary"."analytics_id" AS "analytics_id",
          COUNT(*) AS "count"
        FROM
          "public"."analytics_summary"
        WHERE
          (
            "public"."analytics_summary"."analytics_created_at" >= DATE_TRUNC('week', (NOW() + INTERVAL '-1 week'))
          )
          AND (
            "public"."analytics_summary"."analytics_created_at" < DATE_TRUNC('week', NOW())
          )
        GROUP BY
          "public"."analytics_summary"."analytics_id"
        ORDER BY
          "public"."analytics_summary"."analytics_id" ASC
      ) AS "source"
  ) AS users_last_week,
  (
    SELECT
      COUNT(*)
    FROM
      "public"."submission_services_summary"
    WHERE
      "public"."submission_services_summary"."submitted_at" IS NOT NULL
      AND (
        "public"."submission_services_summary"."submitted_at" >= DATE_TRUNC('week', (NOW() + INTERVAL '-1 week'))
      )
      AND (
        "public"."submission_services_summary"."submitted_at" < DATE_TRUNC('week', NOW())
      )
  ) AS submissions_last_week,
  (
    SELECT
      COUNT(*)
    FROM
      "public"."teams" AS t
      JOIN "public"."team_settings" AS ts ON t.id = ts.team_id
    WHERE
      t."slug" NOT IN (
        'demo',
        'environment-agency',
        'lambeth-sandbox',
        'madetech',
        'open-digital-planning',
        'opensystemslab',
        'planx',
        'scotland',
        'templates',
        'test-april-25',
        'testing',
        'trial',
        'wikihouse'
      )
      AND ts."is_trial" != TRUE
  ) AS active_lpas;
