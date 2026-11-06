import {
  BACS_DEBIT_LIMIT,
  CARD_LIMIT,
  getPaymentMethodTypes,
  PAY_BY_BANK_LIMIT,
} from "./paymentMethods.js";
import { activeCapabilities } from "./test/mocks.js";

// £100 - within every method's limit
const SMALL_TOTAL = 100_00;

describe.each([
  { method: "card", capability: "card_payments", highestTotal: CARD_LIMIT - 1 },
  {
    method: "pay_by_bank",
    capability: "pay_by_bank_payments",
    highestTotal: PAY_BY_BANK_LIMIT,
  },
  {
    method: "bacs_debit",
    capability: "bacs_debit_payments",
    highestTotal: BACS_DEBIT_LIMIT,
  },
] as const)(
  "getPaymentMethodTypes - $method",
  ({ method, capability, highestTotal }) => {
    it("is offered up to its limit", () => {
      expect(
        getPaymentMethodTypes({
          amount: highestTotal,
          capabilities: activeCapabilities,
        }),
      ).toContain(method);
    });

    it("is refused above its limit when it is the only method the council account can take", () => {
      expect(() =>
        getPaymentMethodTypes({
          amount: highestTotal + 1,
          capabilities: { [capability]: "active" },
        }),
      ).toThrow(expect.objectContaining({ status: 409 }));
    });

    it.each(["inactive", "pending", undefined])(
      "is not offered when its capability is %s",
      (status) => {
        expect(
          getPaymentMethodTypes({
            amount: SMALL_TOTAL,
            capabilities: { ...activeCapabilities, [capability]: status },
          }),
        ).not.toContain(method);
      },
    );
  },
);

describe("getPaymentMethodTypes", () => {
  it("refuses a total when the council account can take no method", () => {
    expect(() =>
      getPaymentMethodTypes({ amount: SMALL_TOTAL, capabilities: {} }),
    ).toThrow(expect.objectContaining({ status: 409 }));
  });
});
