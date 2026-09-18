import { getFeeBreakdown } from "@opensystemslab/planx-core";

import { buildLineItems } from "./lineItems.js";

const names = (items: ReturnType<typeof buildLineItems>) =>
  items.map((item) => {
    const priceData = item.price_data;
    if (!priceData?.product_data?.name || priceData.unit_amount === undefined) {
      throw new Error(
        "Expected price_data with a named product and unit_amount",
      );
    }
    return [priceData.product_data.name, priceData.unit_amount] as const;
  });

const total = (items: ReturnType<typeof buildLineItems>) =>
  items.reduce((sum, item) => sum + (item.price_data?.unit_amount ?? 0), 0);

describe("buildLineItems", () => {
  it("converts pounds to pence and derives the application fee as the remainder", () => {
    const feeBreakdown = getFeeBreakdown({
      "application.fee.calculated": 121,
      "application.fee.payable": 145,
      "application.fee.serviceCharge": 20,
      "application.fee.serviceCharge.VAT": 4,
    });

    expect(names(buildLineItems(feeBreakdown))).toEqual([
      ["Application fee", 12100],
      ["Service charge", 2400],
    ]);
  });

  it("omits components that are zero", () => {
    const feeBreakdown = getFeeBreakdown({
      "application.fee.calculated": 100,
      "application.fee.payable": 100,
    });

    expect(names(buildLineItems(feeBreakdown))).toEqual([
      ["Application fee", 10000],
    ]);
  });

  it("keeps VAT bundled into each line and always sums to the payable total", () => {
    const feeBreakdown = getFeeBreakdown({
      "application.fee.calculated": 100,
      "application.fee.payable": 165,
      "application.fee.payable.VAT": 11,
      "application.fee.serviceCharge": 25,
      "application.fee.serviceCharge.VAT": 5,
      "application.fee.fastTrack": 20,
      "application.fee.fastTrack.VAT": 4,
      "application.fee.paymentProcessing": 5,
      "application.fee.paymentProcessing.VAT": 1,
    });

    const items = buildLineItems(feeBreakdown);

    expect(names(items)).toEqual([
      ["Application fee", 10500],
      ["Fast Track fee", 2400],
      ["Service charge", 3000],
      ["Payment processing fee (1%)", 600],
    ]);
    expect(total(items)).toBe(16500);
  });

  it("folds reductions into the application fee, keeping the total at payable", () => {
    const feeBreakdown = getFeeBreakdown({
      "application.fee.calculated": 200,
      "application.fee.payable": 150,
      "application.fee.reduction.sports": ["true"],
    });

    const items = buildLineItems(feeBreakdown);

    expect(names(items)).toEqual([["Application fee", 15000]]);
    expect(total(items)).toBe(15000);
  });

  it("falls back to a single line if the itemised fees exceed the payable total", () => {
    const feeBreakdown = getFeeBreakdown({
      "application.fee.calculated": 10,
      "application.fee.payable": 30,
      "application.fee.serviceCharge": 40,
      "application.fee.serviceCharge.VAT": 8,
    });

    expect(names(buildLineItems(feeBreakdown))).toEqual([
      ["Planning application fee", 3000],
    ]);
  });
});
