-- Default to UK extent
alter table "public"."teams" add column "boundary" jsonb
not null default '{
    "type": "Feature",
    "properties": {},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [1.9134116, 49.528423],
            [1.9134116, 61.331151],
            [1.9134116, 61.331151],
            [-10.76418, 61.331151],
            [-10.76418, 49.528423]
        ]]
    }
}';

comment on column "public"."teams"."boundary" is E'GeoJSON boundary for team provided by planning.data.gov.uk. Simplified boundary_bbox should generally by used where possible. Defaults to UK extent.';

-- Return a simplified bounding box instead of full GeoJSON
CREATE OR REPLACE FUNCTION public.boundary_bbox(teams_row teams)
RETURNS JSONB AS $$
    SELECT
        jsonb_build_object(
            'type',
            'Feature',
            'geometry',
            (
                ST_AsGeoJSON(ST_ENVELOPE(ST_GeomFromGeoJSON(boundary.geom))) :: jsonb
            ),
            'properties',
            boundary.properties
        )
    FROM
        (
            SELECT
                boundary -> 'geometry' as geom,
                boundary -> 'properties' as properties
            FROM
                teams
            WHERE
                teams.id = teams_row.id
        ) as boundary
$$ LANGUAGE sql STABLE;
