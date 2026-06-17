UPDATE flows
SET can_create_from_copy = false
WHERE is_template = true
AND is_service = true
AND status = 'online';