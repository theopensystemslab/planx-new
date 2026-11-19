import type { EmailTemplate } from "./index.js";

/**
 * Sent to the payer whose delayed payment (e.g. Bacs) failed
 */
export type PaymentFailedPayerTemplate = EmailTemplate<
  "payment-failed-payer",
  {
    serviceName: string;
    councilName: string;
    sessionId: string;
    address: string;
    paymentReference: string;
    amount: string;
    councilLogo: string;
    councilPrimaryColour: string;
    payLink: string;
    payByDate: string;
  }
>;
