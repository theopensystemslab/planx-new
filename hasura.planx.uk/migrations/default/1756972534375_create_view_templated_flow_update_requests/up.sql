CREATE VIEW templated_flow_update_requests AS (
    SELECT 
      hse.payload ->> 'sourceFlowId' as source_template_id,
      hse.payload ->> 'templatedFlowId' as templated_flow_id,
      hse.id as event_id,
      hse.created_at as event_created_at,
    	hse.scheduled_time as event_scheduled_at,
    	il.created_at as event_invoked_at,
    	hse.status as event_status,
    	hse.tries,
    	hse.next_retry_at,
    	hse.webhook_conf as request_webhook,
    	il.status as request_status,
    	il.request,
    	il.response
    FROM hdb_catalog.hdb_scheduled_events hse
        JOIN hdb_catalog.hdb_scheduled_event_invocation_logs il ON hse.id = il.event_id
    WHERE comment LIKE 'update_templated_flow_%'
);
