DROP VIEW IF EXISTS "public"."service_charges";
CREATE OR REPLACE VIEW "public"."service_charges" AS (
    select 
      ps.team_slug,
      f.slug as flow_slug,
      f.name as flow_name,
      ps.session_id,
      ps.payment_id,
      (ps.fee_breakdown->'amount'->>'serviceCharge')::numeric as service_charge_amount,
      ps.created_at as paid_at,
      extract(month from ps.created_at) as paid_at_month,
      to_char(ps.created_at, 'Month') as paid_at_month_text,
      extract(quarter from ps.created_at) as paid_at_quarter,
      extract(year from ps.created_at) as paid_at_year
    from payment_status ps
      left join flows f on f.id = ps.flow_id
    where (ps.fee_breakdown->'amount'->>'serviceCharge')::numeric > 0
    and ps.status = 'success'
);

