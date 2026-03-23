UPDATE flows
SET submission_email_id = fi.email_id
FROM flow_integrations fi
WHERE flows.id = fi.flow_id;
