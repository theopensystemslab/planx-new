import type Stripe from "stripe";

import { ServerError } from "../../../errors/index.js";
import { formatPence } from "../helpers.js";

type PaymentMethodType = "card" | "pay_by_bank" | "bacs_debit";

type PaymentCapabilities = Pick<
  Stripe.Account.Capabilities,
  "card_payments" | "pay_by_bank_payments" | "bacs_debit_payments"
>;

/**
 * Card payments above this amount are blocked due to high fees
 */
export const CARD_LIMIT = 600_00;

/**
 * Stripe's default Pay by Bank limit (£10k in pence)
 *
 * @docs https://docs.stripe.com/payments/pay-by-bank
 */
export const PAY_BY_BANK_LIMIT = 10_000_00;

/**
 * Stripe's default Bacs Direct Debit limit per payment (£10k in pence)
 *
 * @docs https://docs.stripe.com/payments/bacs-debit
 */
export const BACS_DEBIT_LIMIT = 10_000_00;

const CAPABILITY_FOR_METHOD: Record<
  PaymentMethodType,
  keyof PaymentCapabilities
> = {
  card: "card_payments",
  pay_by_bank: "pay_by_bank_payments",
  bacs_debit: "bacs_debit_payments",
};

const IS_WITHIN_LIMIT: Record<PaymentMethodType, (amount: number) => boolean> =
  {
    card: (amount) => amount < CARD_LIMIT,
    pay_by_bank: (amount) => amount <= PAY_BY_BANK_LIMIT,
    bacs_debit: (amount) => amount <= BACS_DEBIT_LIMIT,
  };

const PAYMENT_METHODS: PaymentMethodType[] = [
  "card",
  "pay_by_bank",
  "bacs_debit",
];

const getMethodsForAmount = (amount: number): PaymentMethodType[] =>
  PAYMENT_METHODS.filter((method) => IS_WITHIN_LIMIT[method](amount));

const isActiveFor =
  (capabilities: PaymentCapabilities) =>
  (method: PaymentMethodType): boolean =>
    capabilities[CAPABILITY_FOR_METHOD[method]] === "active";

/**
 * The payment methods an applicant can use to pay a total (in pence) to a council account
 *
 * With on_behalf_of, Stripe refuses a method the council account cannot take, so those are removed
 * Card is never offered from the card limit up, even if nothing else is available - card fees are too high
 */
export const getPaymentMethodTypes = ({
  amount,
  capabilities,
}: {
  amount: number;
  capabilities: PaymentCapabilities;
}): PaymentMethodType[] => {
  const methods = getMethodsForAmount(amount).filter(isActiveFor(capabilities));

  if (!methods.length) {
    throw new ServerError({
      status: 409,
      message: `The Stripe account for this local authority cannot take a payment method for a total of ${formatPence(amount)}`,
    });
  }

  return methods;
};
