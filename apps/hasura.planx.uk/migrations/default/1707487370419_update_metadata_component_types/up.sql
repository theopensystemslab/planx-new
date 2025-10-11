UPDATE public.analytics_logs
SET metadata = jsonb_set(
    metadata,
    '{back,type}',
    CASE 
        WHEN metadata->'back'->>'type' = 'Statement' THEN '"Question"'
        WHEN metadata->'back'->>'type' = 'Response' THEN '"Answer"'
        ELSE metadata->'back'->>'type'
    END::jsonb
)
WHERE metadata->'back'->>'type' IN ('Statement', 'Response');

UPDATE public.analytics_logs
SET metadata = jsonb_set(
    metadata,
    '{change,type}',
    CASE 
        WHEN metadata->'change'->>'type' = 'Statement' THEN '"Question"'
        WHEN metadata->'change'->>'type' = 'Response' THEN '"Answer"'
        ELSE metadata->'change'->>'type'
    END::jsonb
)
WHERE metadata->'change'->>'type' IN ('Statement', 'Response');
