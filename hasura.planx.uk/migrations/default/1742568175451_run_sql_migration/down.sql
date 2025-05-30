DELETE FROM "public"."feedback_status_enum" WHERE value = 'in_progress';
DELETE FROM "public"."feedback_status_enum" WHERE value = 'actioned';

INSERT INTO "public"."feedback_status_enum"("value", "comment") 
VALUES 
  (E'read', E'Feedback has been actioned'),
  (E'to_follow_up', E'Further action required');