import type { FeeBreakdown } from "@opensystemslab/planx-core/types";
import type Stripe from "stripe";

import { getFeeLines, toPence } from "../feeLines.js";

type LineItem = Stripe.Checkout.SessionCreateParams.LineItem;

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
 * Each line is displayed inclusive of VAT
 *
 * TODO: VAT not displayed, need to look into Stripe tax handling
 */
export const buildLineItems = (feeBreakdown: FeeBreakdown): LineItem[] => {
  const feeLines = getFeeLines(feeBreakdown);

  // Fallback in case of an inconsistent fee breakdown
  if (!feeLines) {
    return [
      lineItem(
        "Planning application fee",
        toPence(feeBreakdown.amount.payable),
      ),
    ];
  }

  return feeLines.map(({ description, total }) => lineItem(description, total));
};
