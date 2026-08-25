-- Powers the explore page "Search PlanX" feature: fuzzy search over flows & templates, by name
-- ranked by similarity using pg_trgm

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX flows_name_trgm_idx ON public.flows
USING GIN (name gin_trgm_ops);

-- question - do we want any other columns to be searchable? should index those also if so

-- searchable_flows view exists mainly to more precisely scope permissions
-- it's scoped to only the columns the search feature actually needs
CREATE VIEW public.searchable_flows AS
SELECT
  id,
  name,
  slug,
  description,
  status,
  is_template,
  can_create_from_copy,
  templated_from,
  team_id
FROM public.flows
WHERE deleted_at IS NULL;

CREATE FUNCTION public.search_flows(search text)
RETURNS SETOF public.searchable_flows AS $$
  SELECT
    id,
    name,
    slug,
    description,
    status,
    is_template,
    can_create_from_copy,
    templated_from,
    team_id
  FROM public.flows
  WHERE deleted_at IS NULL
    AND search <% COALESCE(name, '')
  ORDER BY similarity(search, COALESCE(name, '')) DESC;
$$ LANGUAGE sql STABLE;
