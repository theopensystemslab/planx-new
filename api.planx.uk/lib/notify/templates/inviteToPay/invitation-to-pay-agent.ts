import { type NotifyConfig, type NotifyTemplate } from "../index.js";

/**
 * GovNotify template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/a964d10a-5442-42fa-b94b-b6623450cd68
 */
export const invitationToPayAgentTemplate: NotifyTemplate<Config> = {
  id: "a964d10a-5442-42fa-b94b-b6623450cd68",
  access: "private",
  config: {} as Config,
};

export type Config = NotifyConfig<{
  payeeName: string;
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
