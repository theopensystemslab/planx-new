import type { RequestHandler } from "express";
import Stripe from "stripe";

export interface StripeCheckoutBody {
  amount: number;
  serviceCharge: number;
  metadata: Record<string, string>;
  paymentMethodTypes?: ("card" | "bacs_debit")[];
  connectedAccountId?: string;
}

export const getStripeCheckoutSession: RequestHandler = async (req, res, next) => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return next({ status: 500, message: "Stripe is not configured" });

  const stripe = new Stripe(secretKey);
  const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
  const isTest = !process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_");
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  res.json({
    paymentIntentId,
    stripeUrl: paymentIntentId
      ? `https://dashboard.stripe.com/${isTest ? "test/" : ""}payments/${paymentIntentId}`
      : null,
  });
};

export const createStripeCheckoutSession: RequestHandler = async (
  req,
  res,
  next,
) => {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return next({
      status: 500,
      message: "Stripe is not configured — set STRIPE_SECRET_KEY",
    });
  }

  const stripe = new Stripe(secretKey);
  const {
    amount,
    serviceCharge,
    metadata,
    paymentMethodTypes = ["card"],
    connectedAccountId: bodyAccountId,
  } = req.body as StripeCheckoutBody;

  const connectedAccountId = bodyAccountId || process.env.STRIPE_CONNECTED_ACCOUNT_ID;
  if (!connectedAccountId) {
    return next({
      status: 500,
      message:
        "No connected account ID — set STRIPE_CONNECTED_ACCOUNT_ID or pass connectedAccountId in the request",
    });
  }

  const editorUrl =
    process.env.EDITOR_URL_EXT ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: paymentMethodTypes,
    line_items: [
      {
        price_data: {
          currency: "gbp",
          product_data: {
            name:
              metadata.application_type ?? "Planning Application Fee",
            description: `${metadata.council} — ${metadata.property_address}`,
          },
          // Total charge is application fee + OSL service charge.
          // OSL absorbs the Stripe processing fee from the service charge portion.
          unit_amount: amount + serviceCharge,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${editorUrl}/stripe-test/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${editorUrl}/stripe-test`,
    payment_intent_data: {
      // Destination charge: funds flow to connected council account.
      // application_fee_amount is the OSL service charge that stays on the platform account.
      application_fee_amount: serviceCharge,
      transfer_data: { destination: connectedAccountId },
      metadata,
    },
  });

  res.json({ url: session.url });
};
