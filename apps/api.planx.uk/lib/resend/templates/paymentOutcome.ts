import type { EmailTemplate } from "./index.js";

/**
 * The result of a delayed payment (e.g. Bacs Direct Debit), which arrives days after the application was submitted
 *
 * Template content is not placeholder for now, depends on what's needed in actual templates
 */
type PaymentOutcomeVariables = {
  serviceName: string;
  councilName: string;
  sessionId: string;
  address: string;
  paymentReference: string;
  paymentMethod: string;
  amount: string;
};

/**
 * Sent to the council when a delayed payment for a submitted application succeeds
 */
export type PaymentConfirmedCouncilTemplate = EmailTemplate<
  "payment-confirmed-council",
  PaymentOutcomeVariables & {
    paymentDate: string;
  }
>;

/**
 * Sent to the council when a delayed payment for a submitted application fails
 * The council chases the fee - PlanX does not offer a way to pay again
 */
export type PaymentFailedCouncilTemplate = EmailTemplate<
  "payment-failed-council",
  PaymentOutcomeVariables & {
    failureCode: string;
    failureMessage: string;
  }
>;

/**
 * Sent to the payer whose delayed payment failed - the applicant (self-pay), or the nominee (invite to pay)
 */
export type PaymentFailedPayerTemplate = EmailTemplate<
  "payment-failed-payer",
  PaymentOutcomeVariables
>;
