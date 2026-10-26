CREATE OR REPLACE VIEW "public"."service_charges" AS 
 SELECT ps.team_slug,
    f.slug AS flow_slug,
    f.name AS flow_name,
    ps.session_id,
    coalesce(ps.payment_id, ps.stripe_payment_id) as payment_id,
    (((ps.fee_breakdown -> 'amount'::text) ->> 'serviceCharge'::text))::numeric AS service_charge_amount,
    ps.created_at AS paid_at,
    EXTRACT(month FROM ps.created_at) AS month,
    to_char(ps.created_at, 'Month'::text) AS month_text,
        CASE
            WHEN (EXTRACT(quarter FROM ps.created_at) = (1)::numeric) THEN (4)::numeric
            ELSE (EXTRACT(quarter FROM ps.created_at) - (1)::numeric)
        END AS fiscal_year_quarter,
        CASE
            WHEN (EXTRACT(month FROM ps.created_at) <= (3)::numeric) THEN (EXTRACT(year FROM ps.created_at) - (1)::numeric)
            ELSE EXTRACT(year FROM ps.created_at)
        END AS fiscal_year
   FROM (payment_status ps
     LEFT JOIN flows f ON ((f.id = ps.flow_id)))
  WHERE (((((ps.fee_breakdown -> 'amount'::text) ->> 'serviceCharge'::text))::numeric > (0)::numeric) 
    AND (ps.status = 'success'::text OR ps.stripe_status = 'succeeded'::text));
