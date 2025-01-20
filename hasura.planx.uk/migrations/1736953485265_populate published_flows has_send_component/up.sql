WITH ranked_flows AS (
  SELECT *,
    ROW_NUMBER() OVER (PARTITION BY flow_id ORDER BY created_at DESC) as rn
  FROM "public"."published_flows"
  WHERE EXISTS (
    SELECT 1 
    FROM jsonb_each(data) as objects(key, value)
    WHERE 
        key NOT IN ('_root')
        AND (value->>'type')::integer = 650
  )
)
UPDATE "public"."published_flows"
SET has_send_component = true
WHERE id IN (
  SELECT id 
  FROM ranked_flows 
  WHERE rn = 1
);