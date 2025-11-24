CREATE OR REPLACE FUNCTION public.flow_first_online_at(flow_row flows)
 RETURNS timestamp without time zone
 LANGUAGE sql
 STABLE
AS $function$
  SELECT
    MIN(event_start)
  FROM
    flow_status_history
  WHERE
    flow_id = flow_row.id
  AND status = 'online'
$function$;
