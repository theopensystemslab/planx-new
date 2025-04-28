import type { EmailFooter, NotifyConfig, NotifyTemplate } from "../index.js";

/**
 * GovNotify template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/825d51cf-f018-46c7-b381-81472c9507f7
 */
export const paymentExpiryTemplate: NotifyTemplate<Config> = {
  id: "825d51cf-f018-46c7-b381-81472c9507f7",
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
  }
>;
