import { type NotifyConfig, type NotifyTemplate } from "../index.js";

/**
 * GovNotify template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/de02ca5c-fc1e-4360-8848-1f413bbd39e9
 */
export const paymentReminderAgentTemplate: NotifyTemplate<Config> = {
  id: "de02ca5c-fc1e-4360-8848-1f413bbd39e9",
  access: "private",
  config: {} as Config,
};

export type Config = NotifyConfig<{
  payeeName: string;
  expiryDate: string;
  serviceName: string;
  sessionId: string;
  fee: string;
  address: string;
  projectType: string;
  paymentLink: string;
  helpEmail: string;
  helpOpeningHours: string;
  helpPhone: string;
}>;
