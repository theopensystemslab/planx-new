CREATE TABLE "public"."downtime_banner" (
  "name" text NOT NULL DEFAULT 'DowntimeBanner', 
  "is_visible" boolean NOT NULL DEFAULT false, 
  "updated_at" timestamp NOT NULL DEFAULT now(), 
  PRIMARY KEY ("name"), 
  UNIQUE ("name"), 
  CONSTRAINT "restrict_to_single_row" CHECK (name = 'DowntimeBanner'));
  
COMMENT ON TABLE "public"."downtime_banner" IS E'Control whether the <DowntimeBanner /> component is visible, effective immediately without a code deployment';

INSERT INTO downtime_banner (name) VALUES ('DowntimeBanner');
