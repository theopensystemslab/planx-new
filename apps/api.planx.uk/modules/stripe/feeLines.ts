import type { FeeBreakdown } from "@opensystemslab/planx-core/types";

export const toPence = (pounds: number): number => Math.round(pounds * 100);

/**
 * Who receives each part of a Stripe payment (see calculateStripeSplit())
 *  - planx: the service charge, retained as the Stripe application fee
 *  - council: everything else, transferred to the council's connected account
 */
export type FeePayee = "council" | "planx";

/**
 * All monetary values are in pence
 */
export interface FeeLine {
  description: string;
  payee: FeePayee;
  net: number;
  vat: number;
  total: number;
}

const feeLine = (
  description: string,
  payee: FeePayee,
  pounds: number,
  poundsVAT: number,
): FeeLine => {
  const total = toPence(pounds + poundsVAT);
  const vat = toPence(poundsVAT);
  return { description, payee, net: total - vat, vat, total };
};

/**
 * Itemise a fee breakdown into the lines shown on Stripe Checkout and on VAT invoices
 *
 * The application fee is derived as the remainder of the payable total, so lines always sum to `payable`
 * Reductions and exemptions are folded into the application fee, as Stripe line items cannot be negative
 *
 * Returns null if the itemised fees exceed the payable total
 *
 */
export const getFeeLines = (feeBreakdown: FeeBreakdown): FeeLine[] | null => {
  const { amount } = feeBreakdown;

  const secondaryLines = [
    feeLine("Fast Track fee", "council", amount.fastTrack, amount.fastTrackVAT),
    feeLine(
      "PlanX service charge",
      "planx",
      amount.serviceCharge,
      amount.serviceChargeVAT,
    ),
  ].filter(({ total }) => total > 0);

  const secondaryTotal = secondaryLines.reduce(
    (sum, { total }) => sum + total,
    0,
  );
  const applicationFeeTotal = toPence(amount.payable) - secondaryTotal;

  // Discretionary services may charge VAT on the application fee, reduced in proportion to any reduction or exemption
  const applicationFeeVAT = toPence(
    amount.calculatedVAT + amount.reductionVAT + amount.exemptionVAT,
  );
  const applicationFeeNet = applicationFeeTotal - applicationFeeVAT;

  if (applicationFeeTotal < 0) return null;

  return [
    {
      description: "Application fee",
      payee: "council",
      net: applicationFeeNet,
      vat: applicationFeeVAT,
      total: applicationFeeTotal,
    },
    ...secondaryLines,
  ];
};
