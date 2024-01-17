ALTER TABLE feedback DROP CONSTRAINT feedback_feedback_type_fkey;

ALTER TABLE feedback DROP CONSTRAINT feedback_status_fkey;

DROP TABLE public.feedback;