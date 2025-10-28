CREATE OR REPLACE FUNCTION concat_address_parts(addr_row addresses)
RETURNS TEXT AS $$
    SELECT concat_ws(
        ', ',
        nullif(trim(addr_row.organisation), ''),  -- nullif handles empty strings as null
        nullif(trim(addr_row.sao), ''),
        concat_ws(
            ' ',
            nullif(trim(addr_row.pao), ''), 
            nullif(trim(addr_row.street), '')
        ),
        nullif(trim(addr_row.town), '')
    )
$$ LANGUAGE sql STABLE;
