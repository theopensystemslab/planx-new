CREATE TABLE public.address_base (
    uprn text NOT NULL,
    parent_uprn text,
    udprn text,
    usrn text NOT NULL,
    toid text NOT NULL,
    classification_code text NOT NULL,
    easting text NOT NULL,
    northing text NOT NULL,
    latitude text NOT NULL,
    longitude text NOT NULL,
    rpc text NOT NULL,
    last_update_date text NOT NULL,
    single_line_address text NOT NULL,
    po_box text NOT NULL,
    organisation text NOT NULL,
    sub_building text NOT NULL,
    building_name text NOT NULL,
    building_number text NOT NULL,
    street_name text NOT NULL,
    locality text NOT NULL,
    town_name text NOT NULL,
    post_town text NOT NULL,
    island text NOT NULL,
    postcode text NOT NULL,
    delivery_point_suffix text NOT NULL,
    gss_code text NOT NULL,
    change_code text NOT NULL
);
COMMENT ON TABLE public.address_base IS 'OrdnanceSurvey AddressBase';
ALTER TABLE ONLY public.address_base
    ADD CONSTRAINT address_base_pkey PRIMARY KEY (uprn);
