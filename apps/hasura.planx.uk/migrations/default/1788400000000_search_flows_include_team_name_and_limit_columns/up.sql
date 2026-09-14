-- Include team name in the search vector, alongside flow name/summary/description/limitations.
-- Generated columns can only reference other columns on the same row, so search_vector can no longer be GENERATED ALWAYS
-- it's converted to a plain column kept in sync via triggers on both flows and teams
ALTER TABLE public.flows ALTER COLUMN search_vector DROP EXPRESSION;

CREATE FUNCTION public.compute_flow_search_vector(
  p_name text,
  p_team_name text,
  p_summary text,
  p_description text,
  p_limitations text
) RETURNS tsvector AS $$
  SELECT
    setweight(to_tsvector('english', coalesce(p_name, '')), 'A')
    || setweight(to_tsvector('english', coalesce(p_team_name, '')), 'A')
    || setweight(to_tsvector('english', coalesce(p_summary, '')), 'B')
    || setweight(to_tsvector('english', regexp_replace(coalesce(p_description, ''), '<[^>]+>', ' ', 'g')), 'B')
    || setweight(to_tsvector('english', regexp_replace(coalesce(p_limitations, ''), '<[^>]+>', ' ', 'g')), 'B');
$$ LANGUAGE sql IMMUTABLE;

-- update search vector when flow details change
CREATE FUNCTION public.set_flow_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := public.compute_flow_search_vector(
    NEW.name,
    (SELECT name FROM public.teams WHERE id = NEW.team_id),
    NEW.summary,
    NEW.description,
    NEW.limitations
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER flows_set_search_vector
BEFORE INSERT OR UPDATE OF name, summary, description, limitations, team_id ON public.flows
FOR EACH ROW EXECUTE FUNCTION public.set_flow_search_vector();

-- update search vector when team name changes
CREATE FUNCTION public.refresh_flows_search_vector_for_team() RETURNS trigger AS $$
BEGIN
  UPDATE public.flows
  SET search_vector = public.compute_flow_search_vector(name, NEW.name, summary, description, limitations)
  WHERE team_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER teams_refresh_flows_search_vector
AFTER UPDATE OF name ON public.teams
FOR EACH ROW EXECUTE FUNCTION public.refresh_flows_search_vector_for_team();

-- Backfill existing rows now that team name is part of the vector
UPDATE public.flows f
SET search_vector = public.compute_flow_search_vector(f.name, t.name, f.summary, f.description, f.limitations)
FROM public.teams t
WHERE f.team_id = t.id;


--
CREATE OR REPLACE FUNCTION public.search_flows(search text)
RETURNS SETOF public.flows AS $$
  WITH q AS (
    -- prefix-match each word in the search term (e.g. "appl" matches "apply", "application")
    SELECT to_tsquery('english', string_agg(lexeme || ':*', ' & ')) AS tsq
    FROM unnest(tsvector_to_array(to_tsvector('simple', search))) AS lexeme
  )
  SELECT flows.*
  FROM public.flows, q
  WHERE deleted_at IS NULL
    AND archived_at IS NULL
    AND search_vector @@ q.tsq
  ORDER BY ts_rank(search_vector, q.tsq) DESC;
$$ LANGUAGE sql STABLE;
