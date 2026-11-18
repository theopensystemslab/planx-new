create or replace view "public"."stripe_daily_remittance" as
select
 t.slug as team_slug,
 f.slug as flow_slug,
 ps.session_id,
 ps.stripe_payment_id as payment_id,
 ps.stripe_event_id as event_id,
 ps.amount as amount_in_pence,
 ps.fee_breakdown,
 ps.payment_method,
 ps.stripe_metadata as metadata,
 ps.created_at as paid_at
from payment_status ps
  join flows f on ps.flow_id = f.id
  join teams t on f.team_id = t.id
where ps.stripe_payment_id is not null
    and ps.stripe_status = 'succeeded'
    and ps.created_at >= NOW() - INTERVAL '24 hours'
order by t.slug asc, f.slug asc, ps.created_at desc;
