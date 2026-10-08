import { getFeeBreakdown } from "@opensystemslab/planx-core";

import { buildLineItems } from "./lineItems.js";

describe("buildLineItems", () => {
  it("converts each fee line into a Stripe line item, inclusive of VAT", () => {
    const feeBreakdown = getFeeBreakdown({
      "application.fee.calculated": 100,
      "application.fee.payable": 124,
      "application.fee.payable.VAT": 4,
      "application.fee.fastTrack": 20,
      "application.fee.fastTrack.VAT": 4,
    });

    expect(buildLineItems(feeBreakdown)).toEqual([
      {
        price_data: {
          currency: "gbp",
          product_data: { name: "Application fee" },
          unit_amount: 10000,
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: "gbp",
          product_data: { name: "Fast Track fee" },
          unit_amount: 2400,
        },
        quantity: 1,
      },
    ]);
  });

  it("falls back to a single line for the payable total if the fee breakdown is inconsistent", () => {
    const feeBreakdown = getFeeBreakdown({
      "application.fee.calculated": 10,
      "application.fee.payable": 30,
      "application.fee.serviceCharge": 40,
      "application.fee.serviceCharge.VAT": 8,
    });

    expect(buildLineItems(feeBreakdown)).toEqual([
      {
        price_data: {
          currency: "gbp",
          product_data: { name: "Planning application fee" },
          unit_amount: 3000,
        },
        quantity: 1,
      },
    ]);
  });
});
