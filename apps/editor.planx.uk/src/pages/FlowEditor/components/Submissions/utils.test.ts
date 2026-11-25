import { addDays, subDays } from "date-fns";
import { describe, expect, it } from "vitest";

import { getConsolidatedStatus, isAwaitingPaymentRetry } from "./utils";

const tomorrow = addDays(new Date(), 1).toISOString();
const yesterday = subDays(new Date(), 1).toISOString();

describe("isAwaitingPaymentRetry", () => {
  it("is true for a failed payment which can still be paid again", () => {
    expect(isAwaitingPaymentRetry("Payment_Failed", tomorrow)).toBe(true);
  });

  it("is false once the window to pay again has passed", () => {
    expect(isAwaitingPaymentRetry("Payment_Failed", yesterday)).toBe(false);
  });

  it("is false without a date to pay by (e.g. a card payment)", () => {
    expect(isAwaitingPaymentRetry("Payment_Failed", null)).toBe(false);
  });

  it("is false for any other status", () => {
    expect(isAwaitingPaymentRetry("Processing", tomorrow)).toBe(false);
  });
});

describe("getConsolidatedStatus", () => {
  it("shows a Bacs payment which can still be paid again as awaiting retry", () => {
    expect(getConsolidatedStatus("Payment_Failed", "Pay", tomorrow)).toBe(
      "Awaiting payment retry",
    );
  });

  it("shows a failed payment which can't be paid again as failed", () => {
    expect(getConsolidatedStatus("Payment_Failed", "Pay", yesterday)).toBe(
      "Pay failed",
    );
    expect(getConsolidatedStatus("Payment_Failed", "Pay", null)).toBe(
      "Pay failed",
    );
  });
});
