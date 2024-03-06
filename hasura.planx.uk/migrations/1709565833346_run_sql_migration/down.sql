-- Revoke select permissions from views used by Metabase
REVOKE SELECT ON public.analytics_summary FROM metabase_read_only;
REVOKE SELECT ON public.feedback_summary FROM metabase_read_only;
REVOKE SELECT ON public.submission_services_summary FROM metabase_read_only;

-- Revoke usage on schema
REVOKE USAGE ON SCHEMA public FROM metabase_read_only;

-- Drop the role
DROP ROLE IF EXISTS metabase_read_only;
