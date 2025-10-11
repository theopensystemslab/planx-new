alter table "public"."team_themes" drop column "secondary_colour" cascade;

alter table "public"."team_themes" add column "link_colour" text
  not null default '#0010A4';
alter table "public"."team_themes" add column "action_colour" text
  not null default '#0010A4';


comment on column "public"."team_themes"."link_colour" is E'Must be hex triplet (e.g. #112233)';
comment on column "public"."team_themes"."action_colour" is E'Must be hex triplet (e.g. #112233)';
