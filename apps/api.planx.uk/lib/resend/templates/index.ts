import type {
  PaymentConfirmedCouncilTemplate,
  PaymentConfirmedPayerTemplate,
} from "./paymentConfirmation.js";
import type { SubmitTemplate } from "./submit.js";
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
  "payment-confirmed-payer": PaymentConfirmedPayerTemplate;
  "payment-confirmed-council": PaymentConfirmedCouncilTemplate;
}

export type ResendTemplate = keyof TemplateRegistry;
