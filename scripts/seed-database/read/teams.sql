COPY (
  SELECT
  id,
  name,
  slug,
  theme,
  settings,
  notify_personalisation
  FROM teams
)
TO STDOUT
WITH (FORMAT csv, DELIMITER ";");
