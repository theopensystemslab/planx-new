-- insert team_invoice_details overwriting conflicts
CREATE TEMPORARY TABLE sync_team_invoice_details (
  id serial,
  team_id integer,
  organisation_name text,
  address_line1 text,
  address_line2 text,
  town_city text,
  county text,
  postcode text,
  vat_number text, 
  company_registration text,
  email_address text
);

\COPY sync_team_invoice_details FROM '/tmp/team_invoice_details.csv' WITH (FORMAT csv, DELIMITER ';');

INSERT INTO team_invoice_details (
  id,
  team_id,
  organisation_name,
  address_line1,
  address_line2,
  town_city,
  county,
  postcode,
  vat_number, 
  company_registration,
  email_address
)
SELECT
  id,
  team_id,
  organisation_name,
  address_line1,
  address_line2,
  town_city,
  county,
  postcode,
  vat_number, 
  company_registration,
  email_address
FROM
  sync_team_invoice_details ON CONFLICT (id) DO
UPDATE
SET
  team_id = EXCLUDED.team_id,
  organisation_name = EXCLUDED.organisation_name,
  address_line1 = EXCLUDED.address_line1,
  address_line2 = EXCLUDED.address_line2,
  town_city = EXCLUDED.town_city,
  county = EXCLUDED.county,
  postcode = EXCLUDED.postcode,
  vat_number = EXCLUDED.vat_number, 
  company_registration = EXCLUDED.company_registration,
  email_address = EXCLUDED.email_address
SELECT
  setval('team_invoice_details_id_seq', max(id))
FROM
  team_invoice_details;