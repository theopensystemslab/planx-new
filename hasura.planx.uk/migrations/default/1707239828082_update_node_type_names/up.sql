UPDATE public.analytics_logs SET node_type = 
    CASE 
        WHEN node_type = 'Statement' THEN 'Question'
        WHEN node_type = 'Response' THEN 'Answer'
        ELSE node_type
    END;