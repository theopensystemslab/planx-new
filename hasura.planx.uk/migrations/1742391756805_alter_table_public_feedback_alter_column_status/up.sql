-- Delete existing enums (unused)
DELETE FROM "public"."feedback_status_enum";

-- Populate with new values
INSERT INTO "public"."feedback_status_enum"("value", "comment") 
VALUES 
  (E'unread', E'Feedback not actioned. Default value for new feedback.'),
  (E'read', E'Feedback has been actioned'),
  (E'to_follow_up', E'Further action required'),
  (E'urgent', E'This issue has been deemed urgent and related actions should be completed asap');

-- Set default value
alter table "public"."feedback" alter column "status" set default 'unread';
alter table "public"."feedback" alter column "status" set not null;
