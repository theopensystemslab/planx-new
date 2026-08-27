DROP FUNCTION IF EXISTS public.search_flows(text);
DROP VIEW IF EXISTS public.searchable_flows;
DROP INDEX IF EXISTS flows_search_vector_idx;
ALTER TABLE public.flows DROP COLUMN IF EXISTS search_vector;
