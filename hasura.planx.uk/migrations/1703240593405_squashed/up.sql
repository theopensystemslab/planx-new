CREATE TABLE "public"."team_themes" (
    "id" serial NOT NULL,
    "team_id" integer NOT NULL,
    "primary_colour" text NOT NULL DEFAULT '#0010A4',
    "secondary_colour" text,
    "logo" text,
    "favicon" text,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON UPDATE cascade ON DELETE cascade
);

ALTER TABLE
    "public"."team_themes"
ADD
    CONSTRAINT "team_themes_team_id_key" UNIQUE ("team_id");

COMMENT ON COLUMN "public"."team_themes"."primary_colour" IS E'Must be hex triplet (e.g. #112233)';

COMMENT ON COLUMN "public"."team_themes"."secondary_colour" IS E'Must be hex triplet (e.g. #112233)';

INSERT INTO
    team_themes (team_id, primary_colour, logo)
SELECT
    id AS team_id,
    COALESCE(theme ->> 'primary', '#0010A4') AS primary_colour,
    COALESCE(theme ->> 'logo', NULL) AS logo
FROM
    teams;

ALTER TABLE "public"."teams" DROP COLUMN "theme" CASCADE;