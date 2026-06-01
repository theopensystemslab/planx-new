import type { RequestHandler } from "express";
import Stripe from "stripe";

export interface StripeCheckoutBody {
  amount: number;
  serviceCharge: number;
  metadata: Record<string, string>;
  paymentMethodTypes?: ("card" | "bacs_debit")[];
  connectedAccountId: string;
}

// on_behalf_of makes the charge appear to come from the council (statement descriptor,
// settlement currency, regulatory responsibility). transfer_data.destination creates a
// Transfer to the council's account. Platform pays Stripe fees via application_fee_amount.
function chargeParams(
  connectedAccountId: string,
  serviceCharge: number,
  metadata: Record<string, string>,
): Stripe.Checkout.SessionCreateParams["payment_intent_data"] {
  return {
    application_fee_amount: serviceCharge,
    on_behalf_of: connectedAccountId,
    transfer_data: { destination: connectedAccountId },
    metadata,
  };
}

// Copies the platform PaymentIntent's metadata to the destination_payment on the
// connected account — the charge the council sees in their Stripe dashboard.
//
// Expanding latest_charge on the PI doesn't populate charge.transfer in this flow;
// fetching the charge directly with expand=["transfer"] does.
async function forwardMetadataToConnectedCharge(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<void> {
  if (session.payment_status !== "paid") return;

  const piId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent as Stripe.PaymentIntent | null)?.id;
  if (!piId) return;

  const pi = await stripe.paymentIntents.retrieve(piId, {
    expand: ["latest_charge"],
  });

  const metadata = pi.metadata ?? {};
  if (Object.keys(metadata).length === 0) return;

  const chargeId =
    typeof pi.latest_charge === "string"
      ? pi.latest_charge
      : (pi.latest_charge as Stripe.Charge | null)?.id;
  if (!chargeId) return;

  const connectedAccountId =
    typeof pi.on_behalf_of === "string"
      ? pi.on_behalf_of
      : (pi.on_behalf_of as Stripe.Account | null)?.id;
  if (!connectedAccountId) return;

  const charge = await stripe.charges.retrieve(chargeId, {
    expand: ["transfer"],
  });
  const transfer =
    typeof charge.transfer === "object" && charge.transfer !== null
      ? (charge.transfer as Stripe.Transfer)
      : null;
  if (!transfer) return;

  const destPaymentId =
    typeof transfer.destination_payment === "string"
      ? transfer.destination_payment
      : (transfer.destination_payment as { id: string } | null)?.id;
  if (!destPaymentId) return;

  await stripe.charges.update(
    destPaymentId,
    { metadata },
    { stripeAccount: connectedAccountId },
  );
}

export const getStripeCheckoutSession: RequestHandler = async (
  req,
  res,
  next,
) => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey)
    return next({ status: 500, message: "Stripe is not configured" });

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(
      req.params.sessionId,
    );

    const isTest = !secretKey.startsWith("sk_live_");
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : ((session.payment_intent as Stripe.PaymentIntent | null)?.id ?? null);

    await forwardMetadataToConnectedCharge(stripe, session);

    res.json({
      paymentIntentId,
      stripeUrl: paymentIntentId
        ? `https://dashboard.stripe.com/${isTest ? "test/" : ""}payments/${paymentIntentId}`
        : null,
    });
  } catch (err) {
    next(err);
  }
};

export const createStripeCheckoutSession: RequestHandler = async (
  req,
  res,
  next,
) => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey)
    return next({ status: 500, message: "Stripe is not configured" });

  try {
    const stripe = new Stripe(secretKey);
    const {
      amount,
      serviceCharge,
      metadata,
      paymentMethodTypes = ["card"],
      connectedAccountId,
    } = req.body as StripeCheckoutBody;

    if (!connectedAccountId)
      return next({ status: 400, message: "connectedAccountId is required" });

    const editorUrl = process.env.EDITOR_URL_EXT ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethodTypes,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: metadata.application_type ?? "Planning Application Fee",
              description: `${metadata.council} — ${metadata.property_address}`,
            },
            unit_amount: amount + serviceCharge,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${editorUrl}/stripe-test/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${editorUrl}/stripe-test`,
      payment_intent_data: chargeParams(
        connectedAccountId,
        serviceCharge,
        metadata,
      ),
    });

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
};
