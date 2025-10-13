alter table "public"."team_themes" add column "secondary_colour" text;

comment on column "public"."team_themes"."secondary_colour" is E'Must be hex triplet (e.g. #112233)';