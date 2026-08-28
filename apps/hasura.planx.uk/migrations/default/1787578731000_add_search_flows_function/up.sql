-- Powers the explore page "Search PlanX" feature: search over flows & templates
-- by name, summary, description, and limitations - ranked by relevance using pgvector/pgquery
-- name weighted highest, then summary/description/limitations
-- HTML is stripped from description/limitations before indexing

ALTER TABLE public.flows ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(name, '')), 'A')
  || setweight(to_tsvector('english', coalesce(summary, '')), 'B')
  || setweight(to_tsvector('english', regexp_replace(coalesce(description, ''), '<[^>]+>', ' ', 'g')), 'B')
  || setweight(to_tsvector('english', regexp_replace(coalesce(limitations, ''), '<[^>]+>', ' ', 'g')), 'B')
) STORED;

CREATE INDEX flows_search_vector_idx ON public.flows
USING GIN (search_vector);

CREATE FUNCTION public.search_flows(search text)
RETURNS SETOF public.flows AS $$
  SELECT *
  FROM public.flows
  WHERE deleted_at IS NULL
    AND search_vector @@ plainto_tsquery('english', search)
  ORDER BY ts_rank(search_vector, plainto_tsquery('english', search)) DESC;
$$ LANGUAGE sql STABLE;
