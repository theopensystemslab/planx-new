alter table flows add column "name" text;
update flows set "name" = slug;
