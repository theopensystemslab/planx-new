UPDATE "public"."published_flows"
SET has_send_component = true
WHERE EXISTS (
    SELECT 1 
    FROM jsonb_each(data) as objects(key, value)
    WHERE 
        key NOT IN ('_root')
        AND (value->>'type')::integer = 650
);
