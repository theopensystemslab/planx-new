UPDATE flows
SET can_create_from_copy = true
WHERE is_template = true
AND is_service = true
AND status = 'online';
