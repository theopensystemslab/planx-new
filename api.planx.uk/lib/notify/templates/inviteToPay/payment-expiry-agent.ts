import { type NotifyConfig, type NotifyTemplate } from "../index.js";

/**
 * GovNotify template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/92d9756b-d0ca-4d72-82c8-886c7af492fd
 */
export const paymentExpiryAgentTemplate: NotifyTemplate<Config> = {
  id: "92d9756b-d0ca-4d72-82c8-886c7af492fd",
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
  helpEmail: string;
  helpOpeningHours: string;
  helpPhone: string;
}>;
