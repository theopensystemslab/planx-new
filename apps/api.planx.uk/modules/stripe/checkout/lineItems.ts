import type { FeeBreakdown } from "@opensystemslab/planx-core/types";
import type Stripe from "stripe";

type LineItem = Stripe.Checkout.SessionCreateParams.LineItem;

export const toPence = (pounds: number): number => Math.round(pounds * 100);

const lineItem = (name: string, unitAmount: number): LineItem => ({
  price_data: {
    currency: "gbp",
    product_data: { name },
    unit_amount: unitAmount,
  },
  quantity: 1,
});

/**
 * Build Stripe Checkout line items from a fee breakdown
 *
 * Line items cannot be negative, so reductions and exemptions cannot be displayed
 *
 * TODO: VAT not displayed, need to look into Stripe tax handling
 */
export const buildLineItems = (feeBreakdown: FeeBreakdown): LineItem[] => {
  const { amount } = feeBreakdown;
  const payablePence = toPence(amount.payable);

  const secondaryLines = [
    { name: "Fast Track fee", total: amount.fastTrack + amount.fastTrackVAT },
    {
      name: "PlanX service charge",
      total: amount.serviceCharge + amount.serviceChargeVAT,
    },
  ]
    .map(({ name, total }) => ({ name, pence: toPence(total) }))
    .filter(({ pence }) => pence > 0);

  const secondaryTotal = secondaryLines.reduce(
    (sum, { pence }) => sum + pence,
    0,
  );
  const applicationFeePence = payablePence - secondaryTotal;

  // Fallback in case of any failures above
  if (applicationFeePence < 0) {
    return [lineItem("Planning application fee", payablePence)];
  }

  return [
    lineItem("Application fee", applicationFeePence),
    ...secondaryLines.map(({ name, pence }) => lineItem(name, pence)),
  ];
};
