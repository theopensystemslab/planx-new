import { type NotifyConfig, type NotifyTemplate } from "../index.js";

/**
 * GovNotify template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/3208bf39-152d-4259-9064-ef5e192aeaa6
 */
export const paymentReminderTemplate: NotifyTemplate<Config> = {
  id: "3208bf39-152d-4259-9064-ef5e192aeaa6",
  access: "private",
  config: {} as Config,
};

export type Config = NotifyConfig<{
  agentName: string;
  serviceName: string;
  sessionId: string;
  fee: string;
  address: string;
  projectType: string;
  expiryDate: string;
  paymentLink: string;
  helpEmail: string;
  helpOpeningHours: string;
  helpPhone: string;
}>;
