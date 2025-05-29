CREATE OR REPLACE FUNCTION slugify("value" TEXT)
RETURNS TEXT AS $$
  -- lowercases the string
  WITH "lowercase" AS (
    SELECT lower("value") AS "value"
  ),
  -- remove single and double quotes
  "removed_quotes" AS (
    SELECT regexp_replace("value", '[''"]+', '', 'gi') AS "value"
    FROM "lowercase"
  ),
  -- replaces anything that's not a letter, number or hyphen('-') with a hyphen('-')
  "hyphenated" AS (
    SELECT regexp_replace("value", '[^a-z0-9\\-]+', '-', 'gi') AS "value"
    FROM "removed_quotes"
  ),
  -- trims hyphens('-') if they exist on the head or tail of the string
  "trimmed" AS (
    SELECT regexp_replace(regexp_replace("value", '\-+$', ''), '^\-', '') AS "value"
    FROM "hyphenated"
  ),
  -- replaces multiple hyphens ('--') with a single hypen ('-')
  "deduped" AS (
    SELECT regexp_replace("value", '[-]+', '-', 'gi') AS "value"
    FROM "trimmed"
  )
  SELECT "value" FROM "deduped";
$$ LANGUAGE SQL STABLE;
