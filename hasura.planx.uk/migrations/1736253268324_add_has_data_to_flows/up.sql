alter table "public"."flows" add column "has_send_component" boolean
 null default 'false';

/* The Send component has an enum = 650 */
UPDATE "public"."flows"
SET "has_send_component" = true
WHERE EXISTS (
    SELECT 1 
    FROM jsonb_each(data) as objects(key, value)
    WHERE 
        key NOT IN ('_root')
        AND (value->>'type')::integer = 650
);