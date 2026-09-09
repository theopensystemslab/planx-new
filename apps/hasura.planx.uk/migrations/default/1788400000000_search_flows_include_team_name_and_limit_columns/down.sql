DROP TRIGGER IF EXISTS teams_refresh_flows_search_vector ON public.teams;
DROP FUNCTION IF EXISTS public.refresh_flows_search_vector_for_team();

DROP TRIGGER IF EXISTS flows_set_search_vector ON public.flows;
DROP FUNCTION IF EXISTS public.set_flow_search_vector();

DROP FUNCTION IF EXISTS public.compute_flow_search_vector(text, text, text, text, text);

ALTER TABLE public.flows DROP COLUMN IF EXISTS search_vector;

ALTER TABLE public.flows ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(name, '')), 'A')
  || setweight(to_tsvector('english', coalesce(summary, '')), 'B')
  || setweight(to_tsvector('english', regexp_replace(coalesce(description, ''), '<[^>]+>', ' ', 'g')), 'B')
  || setweight(to_tsvector('english', regexp_replace(coalesce(limitations, ''), '<[^>]+>', ' ', 'g')), 'B')
) STORED;

CREATE INDEX flows_search_vector_idx ON public.flows
USING GIN (search_vector);

CREATE OR REPLACE FUNCTION public.search_flows(search text)
RETURNS SETOF public.flows AS $$
  SELECT *
  FROM public.flows
  WHERE deleted_at IS NULL
    AND search_vector @@ plainto_tsquery('english', search)
  ORDER BY ts_rank(search_vector, plainto_tsquery('english', search)) DESC;
$$ LANGUAGE sql STABLE;
