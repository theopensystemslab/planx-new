alter table "public"."feedback" add constraint "Feedback score between 1 and 5" check (feedback_score BETWEEN 1 AND 5);
