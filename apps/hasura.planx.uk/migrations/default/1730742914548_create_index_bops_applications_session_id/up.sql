CREATE  INDEX "bops_applications_session_id_idx" on
  "public"."bops_applications" using hash ("session_id");
CREATE  INDEX "uniform_applications_session_id_idx" on
  "public"."uniform_applications" using hash ("submission_reference");
CREATE  INDEX "email_applications_session_id_idx" on
  "public"."email_applications" using hash ("session_id");
CREATE  INDEX "s3_applications_session_id_idx" on
  "public"."s3_applications" using hash ("session_id");
CREATE  INDEX "feedback_flow_id_team_id_idx" on
  "public"."feedback" using btree ("team_id", "flow_id");
CREATE  INDEX "reconciliation_requests_session_id_idx" on
  "public"."reconciliation_requests" using hash ("session_id");
CREATE  INDEX "published_flows_created_at_idx" on
  "public"."published_flows" using btree ("created_at" DESC NULLS LAST);
