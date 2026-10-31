import type {
  PaymentConfirmedCouncilTemplate,
  PaymentFailedCouncilTemplate,
  PaymentFailedPayerTemplate,
} from "./paymentOutcome.js";
import type { SubmitTemplate } from "./submit.js";
import type {
  VatInvoiceCouncilTemplate,
  VatInvoicePlanXTemplate,
} from "./vatInvoice.js";
import type { WelcomeTemplate } from "./welcome.js";

export type EmailTemplate<
  TTemplateName extends string,
  TVariables extends Record<string, string | number>,
> = {
  id: TTemplateName;
  variables: TVariables;
};

export interface TemplateRegistry {
  welcome: WelcomeTemplate;
  submit: SubmitTemplate;
  "vat-invoice-council": VatInvoiceCouncilTemplate;
  "vat-invoice-planx": VatInvoicePlanXTemplate;
  "payment-confirmed-council": PaymentConfirmedCouncilTemplate;
  "payment-failed-council": PaymentFailedCouncilTemplate;
  "payment-failed-payer": PaymentFailedPayerTemplate;
}

export type ResendTemplate = keyof TemplateRegistry;
