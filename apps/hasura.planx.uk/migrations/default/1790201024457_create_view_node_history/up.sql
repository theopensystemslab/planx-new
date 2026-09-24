create or replace view "public"."node_content_history" as 
select 
	o.id as operation_id, 
	o.flow_id,
	elem -> 'p' ->> 0 as node_id,
	o.created_at,
	'operation' as type,
	elem as data, -- 'data' is a deconstructed operation
	o.actor_id,
	u.first_name,
	u.last_name
from operations o
 join users u on o.actor_id = u.id
 -- Unnest an array of operations into individual actions, keeping only those that touched 'data' (eg changed content, not graph placement)
 cross join lateral jsonb_array_elements(o.data -> 'op') as elem 
where elem::text like '%data%'
	and o.created_at > (CURRENT_DATE - '1 year'::interval)
order by o.created_at desc;
