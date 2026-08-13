comment on column "public"."flow_note_content"."color" is E'Shared, editable text/colour for a note. A note with more than one flow_note_positions row referencing it is a "clone" - editing this row updates every clone at once.';
alter table "public"."flow_note_content" alter column "color" set default ''#fffdb0'::text';
alter table "public"."flow_note_content" alter column "color" drop not null;
alter table "public"."flow_note_content" add column "color" text;
