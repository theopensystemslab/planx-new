UPDATE analytics_logs
SET allow_list_answers = jsonb_set(
  coalesce(allow_list_answers, '{}'), '{rab.exitReason}', 'null'
)
WHERE node_id IN ('zYRFfYQHFE','DMfGTEtkSY','PDR1jgTr4L');
