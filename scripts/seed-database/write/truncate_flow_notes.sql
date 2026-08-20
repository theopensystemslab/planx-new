-- flow_note_positions.note_id has FK to flow_note_content, so truncating content cascades to positions
TRUNCATE TABLE flow_note_content CASCADE;

