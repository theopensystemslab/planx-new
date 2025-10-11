-- appends gss_code to existing addresses view
CREATE OR REPLACE VIEW addresses AS
  SELECT
    uprn
  , classification_code as blpu_code
  , latitude
  , longitude
  , organisation
  , sub_building as sao
  , building_number as pao
  , street_name as street
  , town_name as town
  , postcode
  , ST_X(ST_Transform(ST_SetSRID(ST_Point(longitude::float, latitude::float), 4326), 27700)) as x
  , ST_Y(ST_Transform(ST_SetSRID(ST_Point(longitude::float, latitude::float), 4326), 27700)) as y
  , blpu_codes.description as planx_description
  , blpu_codes.value as planx_value
  , single_line_address
  , gss_code
  FROM address_base
  JOIN blpu_codes ON classification_code = blpu_codes.code
  ;
