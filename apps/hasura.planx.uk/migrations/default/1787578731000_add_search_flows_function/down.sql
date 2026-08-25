DROP FUNCTION IF EXISTS public.search_flows(text);
DROP VIEW IF EXISTS public.searchable_flows;
DROP INDEX IF EXISTS flows_name_trgm_idx;
DROP EXTENSION IF EXISTS pg_trgm;
