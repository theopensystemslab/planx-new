
comment on table "public"."analytics" is E'Anonymously tracks user\'s initial or resumed visits across all `flows`, then visualized in Metabase';

comment on table "public"."analytics_logs" is E'Links to `analytics` to provide granular details about user interactions with individual questions';

comment on table "public"."bops_applications" is E'Stores a receipt of applications submitted to the Back Office Planning System (BOPS)';

comment on table "public"."flow_schemas" is E'Empty table schema reference by pg function `get_flow_schema` used to create CSV download in Editor debug console';

comment on table "public"."flows" is E'Flows represent the core services, and changes to the flow content are tracked in `operations`';

comment on column "public"."flows"."version" is E'Increments when `operations` are made on this flow';

comment on column "public"."flows"."data" is E'Structured as a Directed Acyclic Graph (DAGs) and stored "unflattened", meaning that the graph includes "_root" nodes only and not individual nodes from external portals';

comment on table "public"."global_settings" is E'Records default service configurations like footer content, can be overridden by custom `team` settings';

comment on table "public"."lowcal_sessions" is E'Introduced when we migrated from local storage to Save & Return to store a representation of a user\'s local session data in order to support simultaneous applications';

comment on table "public"."operations" is E'Represents individual changes to `flow` content, generated by ShareDB Postgres adapter using JSON operational transformation (OT)';

comment on table "public"."published_flows" is E'Snapshots of flow content that are "live" to public users, links to `flows`';

comment on column "public"."published_flows"."data" is E'Different than `flows`, published data are stored as "flattened" DAGs, meaning that the "_root" graph includes individual nodes from external portals';

comment on table "public"."teams" is E'Teams are core way we organise `flows` and configure settings like theme colour, logo, and contact info; name usually reflects a council but not exclusively';

comment on table "public"."uniform_applications" is E'Stores a receipt of applications submitted to Idox/Uniform';

comment on column "public"."uniform_applications"."destination" is E'Does not link directly to `team` because one council may have multiple Uniform instances';

comment on table "public"."users" is E'Grants access to the Editor, currently requires a Google email for single sign-on';

comment on column "public"."users"."email" is E'Create mulitple entries if a user\'s email includes "." or "@googlemail.com"; replace address with "_REMOVED_" to restrict access but retain their edits/`operations` until soft deletes are implemented';

comment on table "public"."team_members" is E'Assigns `users` to `teams`, currently no differences in access or permission levels though';
