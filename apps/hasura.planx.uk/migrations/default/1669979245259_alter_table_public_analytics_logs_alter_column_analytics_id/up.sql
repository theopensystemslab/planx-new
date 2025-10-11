-- There was an inconsistency with `analytics` and `analytics_logs`.
-- The `analytics_id ` column in `analytics_logs` table had an `int` value, but the `analytics`'s id is a `bigint`.
-- This causes a few issues when we are querying on GraphQL using variables.
ALTER TABLE "public"."analytics_logs" ALTER COLUMN "analytics_id" TYPE bigint;
