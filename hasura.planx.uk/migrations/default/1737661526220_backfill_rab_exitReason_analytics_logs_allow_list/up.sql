-- https://editor.planx.uk/open-digital-planning/report-a-planning-breach-scoping/nodes/tpjEjOO1Ne/nodes/zYRFfYQHFE/edit
UPDATE analytics_logs
SET allow_list_answers = jsonb_set(
  coalesce(allow_list_answers, '{}'), '{rab.exitReason}', '["permittedDevelopment"]'
)
WHERE node_id = 'zYRFfYQHFE';

-- https://editor.planx.uk/open-digital-planning/report-a-planning-breach-scoping/nodes/tFY60OO1Ne/nodes/DMfGTEtkSY/edit
UPDATE analytics_logs
SET allow_list_answers = jsonb_set(
  coalesce(allow_list_answers, '{}'), '{rab.exitReason}', '["notDevelopment"]'
)
WHERE node_id = 'DMfGTEtkSY';

-- https://editor.planx.uk/open-digital-planning/report-a-planning-breach-scoping/nodes/8JhePOO1Ne/nodes/PDR1jgTr4L/edit
UPDATE analytics_logs
SET allow_list_answers = jsonb_set(
  coalesce(allow_list_answers, '{}'), '{rab.exitReason}', '["immune"]'
)
WHERE node_id = 'PDR1jgTr4L';
