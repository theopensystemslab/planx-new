import type { EmailFooter, NotifyConfig, NotifyTemplate } from "../index.js";

/**
 * GovNotify application template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/de02ca5c-fc1e-4360-8848-1f413bbd39e9
 */
export const paymentReminderAgentTemplate: NotifyTemplate<Config> = {
  id: "de02ca5c-fc1e-4360-8848-1f413bbd39e9",
  access: "private",
  config: {} as Config,
};

/**
 * GovNotify general template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/471bb143-e4dd-40c7-8923-010885b0ea2b
 */
export const generalPaymentReminderAgentTemplate: NotifyTemplate<Config> = {
  id: "471bb143-e4dd-40c7-8923-010885b0ea2b",
  access: "private",
  config: {} as Config,
};

type Config = NotifyConfig<
  EmailFooter & {
    payeeName: string;
    expiryDate: string;
    serviceName: string;
    sessionId: string;
    fee: string;
    address: string;
    projectType: string;
    paymentLink: string;
  }
>;
