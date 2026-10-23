import type Stripe from "stripe";

type PaymentMethodType = "card" | "pay_by_bank";

type PaymentCapabilities = Pick<
  Stripe.Account.Capabilities,
  "card_payments" | "pay_by_bank_payments"
>;

/**
 * Card payments above this amount are blocked due to high fees
 */
export const CARD_LIMIT = 60_000;

/**
 * Stripe's default Pay by Bank limit (£10k in pence)
 *
 * @docs https://docs.stripe.com/payments/pay-by-bank
 */
export const PAY_BY_BANK_LIMIT = 1_000_000;

const CAPABILITY_FOR_METHOD: Record<
  PaymentMethodType,
  keyof PaymentCapabilities
> = {
  card: "card_payments",
  pay_by_bank: "pay_by_bank_payments",
};

const getMethodsForAmount = (amount: number): PaymentMethodType[] => {
  if (amount < CARD_LIMIT) return ["card", "pay_by_bank"];
  if (amount <= PAY_BY_BANK_LIMIT) return ["pay_by_bank"];
  return ["card"];
};

const isActiveFor =
  (capabilities: PaymentCapabilities) =>
  (method: PaymentMethodType): boolean =>
    capabilities[CAPABILITY_FOR_METHOD[method]] === "active";

/**
 * The payment methods an applicant can use to pay a total (in pence) to a council account
 *
 * With on_behalf_of, Stripe refuses a method the council account cannot take, so those are removed
 * The list is never empty - card is the fallback, and the account check refuses accounts which cannot take card
 */
export const getPaymentMethodTypes = ({
  amount,
  capabilities,
}: {
  amount: number;
  capabilities: PaymentCapabilities;
}): PaymentMethodType[] => {
  const methods = getMethodsForAmount(amount).filter(isActiveFor(capabilities));

  return methods.length ? methods : ["card"];
};
