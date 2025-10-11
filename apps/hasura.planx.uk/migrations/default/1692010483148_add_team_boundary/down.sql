comment on column "public"."teams"."boundary_geojson" is NULL;
ALTER TABLE "public"."teams" DROP COLUMN "boundary_geojson"
DROP FUNCTION IF EXISTS boundary_bbox;