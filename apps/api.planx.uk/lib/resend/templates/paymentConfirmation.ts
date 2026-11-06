import type { EmailTemplate } from "./index.js";

/**
 * Details of a succeeded Stripe payment
 */
type PaymentConfirmedVariables = {
  serviceName: string;
  councilName: string;
  sessionId: string;
  paymentReference: string;
  amount: string;
  paymentDate: string;
};

/**
 * Sent to the payer for every succeeded payment, with the council's branding
 * Their VAT receipt is attached, if the payment had any VAT or a service charge
 */
export type PaymentConfirmedPayerTemplate = EmailTemplate<
  "payment-confirmed-payer",
  PaymentConfirmedVariables & {
    /** Empty if the council has no logo */
    councilLogo: string;
    /** Empty if the council has no primary colour */
    councilPrimaryColour: string;
  }
>;

/**
 * Sent to the council for every succeeded payment, with whichever VAT documents the payment has attached
 *  - A copy of the payer's VAT receipt, if the payment had any VAT or a service charge
 *  - OSL's invoice to the council for the service charge, if there was one
 */
export type PaymentConfirmedCouncilTemplate = EmailTemplate<
  "payment-confirmed-council",
  PaymentConfirmedVariables & {
    address: string;
    paymentMethod: string;
  }
>;
