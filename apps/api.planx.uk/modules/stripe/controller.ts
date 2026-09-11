import { ServerError } from "../../errors/index.js";
import { stripe } from "./client.js";
import type { CreateCheckoutSessionController } from "./types.js";

/**
 * Create a Stripe Checkout Session and return the URL
 */
export const createCheckoutSession: CreateCheckoutSessionController = async (
  _req,
  res,
  next,
) => {
  const { localAuthority } = res.locals.parsedReq.params;
  const { sessionId, flowId, amount, returnURL } = res.locals.parsedReq.body;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // TODO: Configure payment types
      payment_method_types: ["card"],
      // TODO: Read values from FeeBreakdown + flow name
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: { name: "Planning application fee" },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${returnURL}?stripeSessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnURL}?cancelled=true`,
      // TODO: Metadata population
      metadata: { sessionId, flowId },
      payment_intent_data: { metadata: { sessionId, flowId } },
    });

    return res.json({ url: session.url });
  } catch (error) {
    return next(
      new ServerError({
        message: `Failed to create Stripe Checkout Session for ${localAuthority}`,
        status: 500,
        cause: error,
      }),
    );
  }
};
