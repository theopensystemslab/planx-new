UPDATE public.analytics_logs
SET metadata = jsonb_set(
    metadata,
    '{back,type}',
    CASE 
        WHEN metadata->'back'->>'type' = 'Question' THEN '"Statement"'
        WHEN metadata->'back'->>'type' = 'Answer' THEN '"Response"'
        ELSE metadata->'back'->>'type'
    END::jsonb
)
WHERE metadata->'back'->>'type' IN ('Question', 'Answer');

UPDATE public.analytics_logs
SET metadata = jsonb_set(
    metadata,
    '{change,type}',
    CASE 
        WHEN metadata->'change'->>'type' = 'Question' THEN '"Statement"'
        WHEN metadata->'change'->>'type' = 'Answer' THEN '"Response"'
        ELSE metadata->'change'->>'type'
    END::jsonb
)
WHERE metadata->'change'->>'type' IN ('Question', 'Answer');
