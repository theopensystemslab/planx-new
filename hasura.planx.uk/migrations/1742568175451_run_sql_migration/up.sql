DELETE FROM "public"."feedback_status_enum" WHERE value = 'to_follow_up';
DELETE FROM "public"."feedback_status_enum" WHERE value = 'read';

INSERT INTO "public"."feedback_status_enum"("value", "comment") 
VALUES 
  (E'in_progress', E'Feedback is currently being investigated'),
  (E'actioned', E'Feedback has been actioned');
