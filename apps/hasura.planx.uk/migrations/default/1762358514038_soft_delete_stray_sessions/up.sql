UPDATE public.lowcal_sessions 
SET deleted_at = created_at + INTERVAL '28 days'
WHERE
    submitted_at IS NULL
    AND deleted_at IS NULL
    AND locked_at IS NULL
    AND created_at < TIMESTAMPTZ '2025-10-05 02:00:00+00:00';
