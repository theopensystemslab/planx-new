DROP VIEW "public"."stripe_daily_remittance";

CREATE OR REPLACE VIEW "public"."stripe_daily_remittance" AS 
    SELECT t.slug AS team_slug,
    f.slug AS flow_slug,
    ps.session_id,
    ps.stripe_payment_id AS payment_id,
    ps.stripe_event_id AS event_id,
    ps.amount AS amount_in_pence,
    ps.fee_breakdown,
    ps.fee_breakdown -> 'amount' -> 'calculated' as fee,
    ps.fee_breakdown -> 'amount' -> 'calculatedVAT' as fee_vat,
    ps.fee_breakdown -> 'amount' -> 'serviceCharge' as service_charge,
    ps.fee_breakdown -> 'amount' -> 'serviceChargeVAT' as service_charge_vat,
    ps.payment_method,
    ps.stripe_metadata AS metadata,
    ps.created_at AS paid_at
   FROM ((payment_status ps
     JOIN flows f ON ((ps.flow_id = f.id)))
     JOIN teams t ON ((f.team_id = t.id)))
    WHERE ps.stripe_payment_id IS NOT NULL
      AND ps.stripe_status = 'succeeded'
      AND date_trunc('day', ps.created_at, 'Europe/London')
        = date_trunc('day', now() - INTERVAL '1 day', 'Europe/London')
    ORDER BY t.slug, f.slug, ps.created_at DESC;
