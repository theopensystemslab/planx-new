import {
  CARD_LIMIT,
  getPaymentMethodTypes,
  PAY_BY_BANK_LIMIT,
} from "./paymentMethods.js";
import { activeCapabilities } from "./test/mocks.js";

describe("getPaymentMethodTypes", () => {
  it.each([
    { amount: CARD_LIMIT - 1, expected: ["card", "pay_by_bank"] },
    { amount: CARD_LIMIT, expected: ["pay_by_bank"] },
    { amount: PAY_BY_BANK_LIMIT, expected: ["pay_by_bank"] },
  ])(
    "offers $expected for a total of $amount pence",
    ({ amount, expected }) => {
      expect(
        getPaymentMethodTypes({ amount, capabilities: activeCapabilities }),
      ).toEqual(expected);
    },
  );

  it.each(["inactive", "pending", undefined])(
    "removes Pay by Bank when its capability is %s",
    (status) => {
      expect(
        getPaymentMethodTypes({
          amount: CARD_LIMIT - 1,
          capabilities: {
            card_payments: "active",
            pay_by_bank_payments: status,
          },
        }),
      ).toEqual(["card"]);
    },
  );

  it.each(["inactive", "pending", undefined])(
    "removes card when its capability is %s",
    (status) => {
      expect(
        getPaymentMethodTypes({
          amount: CARD_LIMIT - 1,
          capabilities: {
            card_payments: status,
            pay_by_bank_payments: "active",
          },
        }),
      ).toEqual(["pay_by_bank"]);
    },
  );

  it.each([
    { amount: CARD_LIMIT - 1, capabilities: {} },
    {
      amount: CARD_LIMIT,
      capabilities: {
        card_payments: "active",
        pay_by_bank_payments: "inactive",
      },
    },
    {
      amount: PAY_BY_BANK_LIMIT,
      capabilities: {
        card_payments: "active",
        pay_by_bank_payments: "pending",
      },
    },
    { amount: PAY_BY_BANK_LIMIT + 1, capabilities: activeCapabilities },
  ])(
    "refuses a total of $amount pence when no method remains, never falling back to card",
    ({ amount, capabilities }) => {
      expect(() => getPaymentMethodTypes({ amount, capabilities })).toThrow(
        expect.objectContaining({ status: 409 }),
      );
    },
  );
});
