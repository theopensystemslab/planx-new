CREATE OR REPLACE FUNCTION slugify(flow_row flows)
RETURNS TEXT AS $$
  -- lowercases the string
  WITH "lowercase" AS (
    SELECT lower(flow_row.slug) AS slug
  ),
  -- remove single and double quotes
  "removed_quotes" AS (
    SELECT regexp_replace(slug, '[''"]+', '', 'gi') AS slug
    FROM "lowercase"
  ),
  -- replaces anything that's not a letter, number, hyphen, or underscore with a hyphen
  "hyphenated" AS (
    SELECT regexp_replace(slug, '[^a-z0-9\\-_]+', '-', 'gi') AS slug
    FROM "removed_quotes"
  ),
  -- trims hyphens if they exist on the head or tail of the string
  "trimmed" AS (
    SELECT regexp_replace(regexp_replace(slug, '\-+$', ''), '^\-', '') AS slug
    FROM "hyphenated"
  )
  SELECT slug FROM "trimmed"
$$ LANGUAGE SQL STABLE;
