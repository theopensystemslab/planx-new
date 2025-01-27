WITH ranked_flows AS (
  SELECT *,
    ROW_NUMBER() OVER (PARTITION BY flow_id ORDER BY created_at DESC) as rn
  FROM "public"."published_flows"
)
UPDATE "public"."published_flows"
SET has_send_component = false
WHERE id IN (
  SELECT id 
  FROM ranked_flows 
  WHERE rn = 1
);