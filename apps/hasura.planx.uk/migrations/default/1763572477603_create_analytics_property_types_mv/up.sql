CREATE OR REPLACE MATERIALIZED VIEW "public"."analytics_property_types" AS 
SELECT 
    a.id AS analytics_id,
    ((al.allow_list_answers -> 'property.type'::text) ->> 0) AS property_type,
    al.node_type,
    ((al.allow_list_answers -> 'propertyInformation.action'::text))::text AS property_information_action,
    al.node_id,
    ((al.allow_list_answers -> 'property.type.userProvided'::text))::text AS property_type_user_provided
FROM analytics a
LEFT JOIN analytics_logs al ON (a.id = al.analytics_id)
WHERE (
    ((al.allow_list_answers -> 'property.type'::text) ->> 0) IS NOT NULL 
    OR ((al.allow_list_answers -> 'property.type.userProvided'::text))::text IS NOT NULL
    OR ((al.allow_list_answers -> 'propertyInformation.action'::text))::text IS NOT NULL
)
GROUP BY 
    a.id,
    al.node_type,
    ((al.allow_list_answers -> 'property.type'::text) ->> 0),
    ((al.allow_list_answers -> 'propertyInformation.action'::text))::text,
    al.node_id,
    ((al.allow_list_answers -> 'property.type.userProvided'::text))::text;

GRANT SELECT ON VIEW "public"."analytics_property_types" TO "metabase_read_only";