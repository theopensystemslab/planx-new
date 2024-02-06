UPDATE
  public.analytics_logs
SET
  node_type = CASE
    WHEN node_type 'Question' THEN 'Statement'
    WHEN node_type 'Answer' THEN 'Response'
    ELSE node_type
  END;