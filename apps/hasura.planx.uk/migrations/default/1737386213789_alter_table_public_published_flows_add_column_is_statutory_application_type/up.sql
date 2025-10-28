alter table "public"."published_flows" add column "is_statutory_application_type" boolean default 'false';
 comment on column "public"."published_flows"."is_statutory_application_type" is E'This is updated on publish based on the flow graph containing application.type types that are in the ODP Schema';

CREATE OR REPLACE FUNCTION public.diff_latest_published_flow(source_flow_id uuid, since timestamp with time zone)
 RETURNS published_flows
 LANGUAGE sql
 STABLE
AS $function$
WITH current_published_flow as (
  SELECT
    id, data, created_at, flow_id, publisher_id, summary, has_send_component, is_statutory_application_type
  FROM
    published_flows
  WHERE
    published_flows.flow_id = source_flow_id
  ORDER BY
    created_at desc
  LIMIT
    1
),
previous_published_flow as (
  SELECT
    flow_id, data
  FROM
    published_flows
  WHERE
    published_flows.flow_id = source_flow_id
    AND
    published_flows.created_at < since
  ORDER BY
    created_at desc -- the latest published version before "since"
  LIMIT
    1
),
data_diff as (
  SELECT
    flow_id,
    ( SELECT
        jsonb_object_agg(COALESCE(old.key, new.key), new.value)
      FROM
        jsonb_each(previous_published_flow.data) AS old
      FULL OUTER JOIN 
        jsonb_each(current_published_flow.data) AS new 
      ON
        new.key = old.key 
      WHERE 
        new.value IS DISTINCT FROM old.value
    ) as data -- shallow diff where deleted keys have a 'null' value
  FROM 
    current_published_flow
  JOIN
    previous_published_flow USING (flow_id)
)
SELECT 
    id, data_diff.data as data, created_at, flow_id, publisher_id, 'auto generated diff' as summary, has_send_component, is_statutory_application_type
FROM 
    current_published_flow
FULL OUTER JOIN
    data_diff USING (flow_id);
$function$;
