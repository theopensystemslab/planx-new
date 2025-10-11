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
      extract(month from ps.created_at) as month,
      to_char(ps.created_at, 'Month') as month_text,
      case 
        when extract(quarter from ps.created_at) = 1 then 4
        else extract(quarter from ps.created_at) - 1
      end as fiscal_year_quarter,
      case
        -- UK Fiscal Year starts April 1, so Jan - March of current year are "last" fiscal year
        when extract(month from ps.created_at) <= 3 then extract(year from ps.created_at) - 1
        else extract(year from ps.created_at)
      end as fiscal_year
    from payment_status ps
      left join flows f on f.id = ps.flow_id
    where (ps.fee_breakdown->'amount'->>'serviceCharge')::numeric > 0
    and ps.status = 'success'
);
