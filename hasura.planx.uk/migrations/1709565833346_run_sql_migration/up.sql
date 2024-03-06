-- Create the role
CREATE ROLE metabase_read_only;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO metabase_read_only;

-- Grant select permissions on views used by Metabase
GRANT SELECT ON public.analytics_summary TO metabase_read_only;
GRANT SELECT ON public.feedback_summary TO metabase_read_only;
GRANT SELECT ON public.submission_services_summary TO metabase_read_only;