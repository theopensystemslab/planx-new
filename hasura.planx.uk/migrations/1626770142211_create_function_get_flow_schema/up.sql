create or replace function get_flow_schema (published_flow_id text) 
    returns setof flow_schemas -- flow_schemas is empty table, it's schema must be tracked by hasura though
as $$
with last_published_flow as (
        select
            flow_id,
            data
        from published_flows
        where flow_id::text = published_flow_id
        order by id desc
        limit 1 -- only get most recent version of a flow
    ),
    nodes_per_flow as (
        select
            flow_id,
            jsonb_object_keys(data) as node -- make a row per node
        from last_published_flow
    ),
    data_per_node as (
        select 
            n.flow_id,
            n.node,
            p.data->n.node as node_data -- jsonb data filtered to this node
        from nodes_per_flow n
            join last_published_flow p on p.flow_id = n.flow_id
        where length(n.node) = 10 -- filter out _root and portal uuids
    )
    select
        flow_id,
        node,
        (node_data->>'type')::int as "type",
        node_data->'data'->>'text' as "text",
        coalesce(
            node_data->'data'->>'fn',
            node_data->'data'->>'val',
            node_data->'data'->>'output',
            node_data->'data'->>'dataFieldBoundary'
        ) as planx_variable
    from data_per_node
    order by planx_variable asc nulls last;
$$
language sql stable;
