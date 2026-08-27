DROP FUNCTION IF EXISTS public.search_flows(text);
DROP INDEX IF EXISTS flows_search_vector_idx;
ALTER TABLE public.flows DROP COLUMN IF EXISTS search_vector;
