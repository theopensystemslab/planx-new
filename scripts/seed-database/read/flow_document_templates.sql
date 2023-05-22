COPY (SELECT * FROM flow_document_templates) TO STDOUT WITH (FORMAT csv, DELIMITER ';');
