import type { EmailFooter, NotifyConfig, NotifyTemplate } from "../index.js";

/**
 * GovNotify application template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/3208bf39-152d-4259-9064-ef5e192aeaa6
 */
export const paymentReminderTemplate: NotifyTemplate<Config> = {
  id: "3208bf39-152d-4259-9064-ef5e192aeaa6",
  access: "private",
  config: {} as Config,
};

/**
 * GovNotify general template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/d5e15ea2-7db4-47b8-b92d-80be7f5b05aa
 */
export const generalPaymentReminderTemplate: NotifyTemplate<Config> = {
  id: "d5e15ea2-7db4-47b8-b92d-80be7f5b05aa",
  access: "private",
  config: {} as Config,
};

export type Config = NotifyConfig<
  EmailFooter & {
    agentName: string;
    serviceName: string;
    sessionId: string;
    fee: string;
    address: string;
    projectType: string;
    expiryDate: string;
    paymentLink: string;
  }
>;
