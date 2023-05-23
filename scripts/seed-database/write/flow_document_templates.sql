-- insert flow_document_templates skipping conflicts
CREATE TEMPORARY TABLE sync_flow_document_templates (
  flow_id uuid,
  document_template text
);

\copy sync_flow_document_templates FROM '/tmp/flow_document_templates.csv' WITH (FORMAT csv, DELIMITER ';');

INSERT INTO flow_document_templates (
  flow_id,
  document_template
)
SELECT
  flow_id,
  document_template
FROM sync_flow_document_templates
ON CONFLICT (flow_id, document_template) DO NOTHING;
